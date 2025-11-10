import os
from typing import Dict, Any
import base64
from typing import Optional
import pandas as pd

from app.shared.config.config import env
from app.shared.types.return_type import DefaultReturnType, ErrorResponseType


UPLOAD_PATH = env.UPLOAD_PATH or "./uploads"


def ensure_upload_dir():
    """Ensure uploads directory exists"""
    if not os.path.exists(UPLOAD_PATH):
        os.makedirs(UPLOAD_PATH, exist_ok=True)


# Data format:
# {
#   1: {1: "Column 1 Value", 2: "Column 2 Value"},
#   2: {1: "Row 2, Col 1", 2: "Row 2, Col 2"},
#   ...
# }
def tabular_data_to_indexed_dict(df: pd.DataFrame) -> Dict[int, Dict[int, Any]]:
    df = df.where(pd.notnull(df), None)
    df = df.reset_index(drop=True)

    result: Dict[int, Dict[int, Any]] = {}
    for i, row in enumerate(df.itertuples(index=False), start=1):
        row_dict: Dict[int, Any] = {}
        for j, cell in enumerate(row, start=1):
            row_dict[j] = cell
        result[i] = row_dict

    return result


def read_local_file(filename: str) -> DefaultReturnType[Optional[str | list[dict] | dict]]:
    try:
        file_path = os.path.join(UPLOAD_PATH, filename)

        if not os.path.exists(file_path):
            raise FileNotFoundError(f"File {filename} not found")

        extension = os.path.splitext(filename)[1].lower()

        # Handle image files
        if extension in [".png", ".jpg", ".jpeg", ".gif", ".webp"]:
            with open(file_path, "rb") as f:
                encoded = base64.b64encode(f.read()).decode("utf-8")
                mime_type = f"image/{extension[1:]}"
                base64_uri = f"data:{mime_type};base64,{encoded}"
                return DefaultReturnType(data=base64_uri)

        # Handle CSV files
        elif extension == ".csv":
            df = pd.read_csv(file_path)
            return DefaultReturnType(data=tabular_data_to_indexed_dict(df))

        # Handle XLS or XLSX files
        elif extension in [".xls", ".xlsx"]:
            df = pd.read_excel(file_path)
            return DefaultReturnType(data=tabular_data_to_indexed_dict(df))

        # Handle TXT files
        elif extension in [".txt", ".json", ".log", ".md"]:
            with open(file_path, "r", encoding="utf-8") as f:
                content = f.read()
                return DefaultReturnType(data=content)

        # Fallback:
        else:
            return DefaultReturnType(data="Unsupported file format")

    except Exception as error:
        return DefaultReturnType(
            error=ErrorResponseType(
                userMessage=f"Unexpected error processing file!",
                error=str(error),
                errorType="InternalServerErrorException",
                errorData={},
                trace=["aws_s3 - read_local_file - except Exception"],
            )
        )


# Upload file
def upload_local_file(file_bytes: bytes, filename: str) -> DefaultReturnType[Optional[dict]]:
    try:
        ensure_upload_dir()
        name, ext = os.path.splitext(filename)
        unique_name = f"{name}_{int(pd.Timestamp.now().timestamp())}{ext}"
        file_path = os.path.join(UPLOAD_PATH, unique_name)

        with open(file_path, "wb") as f:
            f.write(file_bytes)

        return DefaultReturnType(
            data={
                "filename": unique_name,
                "path": file_path,
                "url": f"/files/{unique_name}",
            }
        )

    except Exception as error:
        return DefaultReturnType(
            error=ErrorResponseType(
                userMessage="Error uploading file locally!",
                error=str(error),
                errorType="InternalServerErrorException",
                errorData={},
                trace=["local_file_service - upload_local_file - except Exception"],
            )
        )


# Delete local file
def delete_local_file(filename: str) -> DefaultReturnType[Optional[dict]]:
    try:
        file_path = os.path.join(UPLOAD_PATH, filename)

        if not os.path.exists(file_path):
            raise FileNotFoundError(f"File {filename} not found")

        os.remove(file_path)
        return DefaultReturnType(data={"deleted": True})

    except Exception as error:
        return DefaultReturnType(
            error=ErrorResponseType(
                userMessage="Error deleting local file!",
                error=str(error),
                errorType="InternalServerErrorException",
                errorData={},
                trace=["local_file_service - delete_local_file - except Exception"],
            )
        )


# Update (replace) local file
def update_local_file(filename: str, new_file_bytes: bytes) -> DefaultReturnType[Optional[dict]]:
    try:
        file_path = os.path.join(UPLOAD_PATH, filename)

        if not os.path.exists(file_path):
            raise FileNotFoundError(f"File {filename} not found")

        with open(file_path, "wb") as f:
            f.write(new_file_bytes)

        return DefaultReturnType(
            data={
                "filename": filename,
                "path": file_path,
                "url": f"/files/{filename}",
                "updated": True,
            }
        )

    except Exception as error:
        return DefaultReturnType(
            error=ErrorResponseType(
                userMessage="Error updating local file!",
                error=str(error),
                errorType="InternalServerErrorException",
                errorData={},
                trace=["local_file_service - update_local_file - except Exception"],
            )
        )


# List all uploaded files
def list_local_files() -> DefaultReturnType[Optional[list[str]]]:
    try:
        ensure_upload_dir()
        files = os.listdir(UPLOAD_PATH)
        return DefaultReturnType(data=files)
    except Exception as error:
        return DefaultReturnType(
            error=ErrorResponseType(
                userMessage="Error listing local files!",
                error=str(error),
                errorType="InternalServerErrorException",
                errorData={},
                trace=["local_file_service - list_local_files - except Exception"],
            )
        )
