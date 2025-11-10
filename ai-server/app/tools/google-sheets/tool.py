from mcp.server.fastmcp import FastMCP
import json
import os
from typing import Any
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

mcp = FastMCP("GoogleSheetsTools")


def get_column_letter(col: int) -> str:
    """Convert column number to letter (e.g., 1 -> A, 27 -> AA)."""
    letter = ''
    while col > 0:
        remainder = (col - 1) % 26
        letter = chr(65 + remainder) + letter
        col = (col - 1) // 26
    return letter


@mcp.tool()
async def google_sheets_read(input_data: Any) -> str:
    """Read data from a Google Sheet using access token, file ID, and optional range."""
    try:
        range_ = None
        limit = 500  # Default max rows

        if input_data:
            try:
                if isinstance(input_data, str):
                    parsed_input = json.loads(input_data)
                elif isinstance(input_data, dict):
                    parsed_input = input_data
                else:
                    parsed_input = {}
                if isinstance(parsed_input, dict):
                    range_ = parsed_input.get("range")
                    if "limit" in parsed_input:
                        limit = min(int(parsed_input["limit"]), 500)

            except json.JSONDecodeError as e:
                pass

        access_token = os.getenv("access_token")
        file_id = os.getenv("file_id")

        if not file_id:
            return json.dumps({
                "status": "failed",
                "format": "string",
                "content": "File ID is missing in configuration or environment"
            })

        if not access_token:
            return json.dumps({
                "status": "failed",
                "format": "string",
                "content": "Access token is missing in configuration or environment"
            })

        creds = Credentials(token=access_token)
        service = build('sheets', 'v4', credentials=creds)
        sheets = service.spreadsheets()

        MAX_ROWS = 500
        MAX_COLS = 500
        last_column_letter = get_column_letter(MAX_COLS)

        effective_range = range_ or ""
        if effective_range:
            effective_range = effective_range.replace(" ", "")
        else:
            # Default to first sheet if no range specified
            spreadsheet = sheets.get(spreadsheetId=file_id).execute()
            first_sheet = next(
                (sheet['properties']['title'] for sheet in spreadsheet.get('sheets', [])
                 if 'properties' in sheet and 'title' in sheet['properties']),
                None
            )

            if not first_sheet:
                return json.dumps({
                    "status": "failed",
                    "format": "string",
                    "content": "No sheets found in the spreadsheet"
                })

            effective_range = f"{first_sheet}!A1:{last_column_letter}{MAX_ROWS}"

        result = sheets.values().get(spreadsheetId=file_id, range=effective_range).execute()
        values = result.get('values', [])[:MAX_ROWS]
        values = [row[:MAX_COLS] for row in values]

        if not values:
            return json.dumps({
                "status": "failed",
                "format": "string",
                "content": "No data found"
            })

        # Join all values into a single comma-separated string
        content = ','.join(str(cell) for row in values for cell in row) or "No data available"

        return json.dumps({
            "status": "success",
            "format": "string",
            "content": content
        })

    except HttpError as e:
        error_details = json.loads(e.content.decode()) if e.content else {
            "message": str(e)}
        return json.dumps({
            "status": "failed",
            "format": "string",
            "content": error_details.get("message", str(e))
        })

    except Exception as e:
        return json.dumps({
            "status": "failed",
            "format": "string",
            "content": str(e)
        })


@mcp.tool()
async def google_sheets_write(input_data: Any) -> str:
    """Write data to a Google Sheet using access token, file ID, and optional range."""
    try:
        data = None
        range_ = None

        if input_data:
            try:
                if isinstance(input_data, str):
                    parsed_input = json.loads(input_data)
                elif isinstance(input_data, dict):
                    parsed_input = input_data
                else:
                    parsed_input = {}
                if isinstance(parsed_input, dict):
                    data = parsed_input.get("data") or parsed_input.get("values")
                    range_ = parsed_input.get("range")

            except json.JSONDecodeError as e:
                data = input_data if isinstance(input_data, str) else ""

        data = data or (input_data if isinstance(input_data, str) else "")

        access_token = os.getenv("access_token")
        file_id = os.getenv("file_id")

        if not file_id:
            return json.dumps({
                "status": "failed",
                "format": "string",
                "content": "File ID is missing in configuration or environment"
            })

        if not access_token:
            return json.dumps({
                "status": "failed",
                "format": "string",
                "content": "Access token is missing in configuration or environment"
            })

        creds = Credentials(token=access_token)
        service = build('sheets', 'v4', credentials=creds)
        sheets = service.spreadsheets()
        effective_range = range_ or ""

        if not effective_range:
            spreadsheet = sheets.get(spreadsheetId=file_id).execute()
            first_sheet = next(
                (sheet['properties']['title'] for sheet in spreadsheet.get('sheets', [])
                 if 'properties' in sheet and 'title' in sheet['properties']),
                None
            )

            if not first_sheet:
                return json.dumps({
                    "status": "failed",
                    "format": "string",
                    "content": "No sheets found in the spreadsheet"
                })

            read_range = f"{first_sheet}!A:A"
            result = sheets.values().get(spreadsheetId=file_id, range=read_range).execute()
            existing_values = result.get('values', [])
            next_row = len(existing_values) + 1
            effective_range = f"{first_sheet}!A{next_row}"

        values = []

        if isinstance(data, str) and data:
            lines = [line.strip() for line in data.split('\n') if line.strip()]
            all_items = [
                cell.strip()
                for line in lines
                for cell in (
                    line.split('|') if '|' in line else
                    line.split('\t') if '\t' in line else
                    line.split(',')
                )
                if cell.strip()
            ]
            values = [all_items] if all_items else []

        elif isinstance(data, (list, tuple)):
            values = data if isinstance(data[0], list) else [data]

        elif data:
            values = [[str(data)]]

        if not values or all(len(row) == 0 for row in values):
            return json.dumps({
                "status": "failed",
                "format": "string",
                "content": "No valid data to write to Google Sheets"
            })

        sheets.values().append(
            spreadsheetId=file_id,
            range=effective_range,
            valueInputOption='RAW',
            insertDataOption='INSERT_ROWS',
            body={'values': values}
        ).execute()

        google_sheet_link = f"https://docs.google.com/spreadsheets/d/{file_id}"

        return json.dumps({
            "status": "success",
            "format": "string",
            "content": google_sheet_link
        })

    except HttpError as e:
        error_details = json.loads(e.content.decode()) if e.content else {
            "message": str(e)}
        return json.dumps({
            "status": "failed",
            "format": "string",
            "content": error_details.get("message", str(e))
        })

    except Exception as e:
        return json.dumps({
            "status": "failed",
            "format": "string",
            "content": str(e)
        })

if __name__ == "__main__":
    mcp.run(transport="stdio")
