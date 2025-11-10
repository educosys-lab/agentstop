import { google } from 'googleapis';
import { sheets_v4 } from 'googleapis/build/src/apis/sheets/v4';

import { GoogleSheetsWriteConfigType, GoogleSheetsWriteDataType, googleSheetsWriteValidate } from './validate';
import { GeneralNodePropsType, GeneralNodeReturnType } from 'src/workflow-system/workflow-system.type';
import { formatLLMResponseToText } from 'src/shared/utils/ai.util';
import { DefaultReturnType } from 'src/shared/types/return.type';
import { returnErrorString } from 'src/shared/utils/return.util';
import { isError } from 'src/shared/utils/error.util';

export const googleSheetsWriteExecute = async ({
	format,
	data,
	config,
}: GeneralNodePropsType<GoogleSheetsWriteDataType, GoogleSheetsWriteConfigType>): Promise<
	DefaultReturnType<GeneralNodeReturnType>
> => {
	try {
		const validate = await googleSheetsWriteValidate({
			format,
			data,
			config,
		});
		if (isError(validate)) {
			return {
				...validate,
				trace: [...validate.trace, 'googleSheetsWriteExecute - googleSheetsWriteValidate'],
			};
		}

		const { defaultData, google_sheets_range_ifAny } = validate.data;
		const { access_token, file_id, google_sheets_range_from_config } = validate.config;

		const google_sheets_range = google_sheets_range_from_config || google_sheets_range_ifAny;

		const oauth2Client = new google.auth.OAuth2();
		oauth2Client.setCredentials({ access_token });

		const sheets: sheets_v4.Sheets = google.sheets({ version: 'v4', auth: oauth2Client });

		let effectiveRange = '';
		const isValidRange =
			google_sheets_range && /^(?:[a-zA-Z0-9\s]+!)?[A-Z]+[0-9]+(?::[A-Z]+[0-9]+)?$/.test(google_sheets_range);
		if (isValidRange) {
			effectiveRange = google_sheets_range;
		} else {
			const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId: file_id });
			const firstSheet = spreadsheet.data.sheets?.[0]?.properties?.title;
			if (!firstSheet) {
				return {
					userMessage: 'No sheets found in the spreadsheet!',
					error: 'No sheets found in the spreadsheet!',
					errorType: 'InternalServerErrorException',
					errorData: {},
					trace: ['googleSheetsWriteExecute - catch'],
				};
			}
			const response = await sheets.spreadsheets.values.get({
				spreadsheetId: file_id,
				range: `${firstSheet}!A:A`,
			});
			const rowCount = response.data.values ? response.data.values.length : 0;
			effectiveRange = `${firstSheet}!A${rowCount + 1}`;
		}

		let messageContent = defaultData;

		if (typeof defaultData === 'object' && defaultData !== null && 'data' in defaultData) {
			messageContent = defaultData.data;
		}

		const formattedDefaultData =
			typeof messageContent === 'string'
				? formatLLMResponseToText(messageContent)
				: JSON.stringify(messageContent);
		if (isError(formattedDefaultData)) {
			return {
				...formattedDefaultData,
				trace: [...formattedDefaultData.trace, 'googleSheetsWriteExecute - formattedDefaultData'],
			};
		}

		let values: any[][];
		if (typeof formattedDefaultData === 'string') {
			const lines = formattedDefaultData
				.trim()
				.split('\n')
				.filter((line) => line.trim() !== '');

			values = lines.map((line) => {
				const separator = line.includes('|') ? /\|/ : line.includes('\t') ? /\t/ : /,/;
				return line
					.trim()
					.split(separator)
					.map((cell) => cell.trim())
					.filter((cell) => cell !== '');
			});
		} else {
			values = Array.isArray(formattedDefaultData) ? formattedDefaultData : [[formattedDefaultData]];
		}

		if (values.length === 0 || values.every((row) => row.length === 0)) {
			return {
				userMessage: 'No valid data to write to Google Sheets!',
				error: 'No valid data to write to Google Sheets!',
				errorType: 'InternalServerErrorException',
				errorData: {},
				trace: ['googleSheetsWriteExecute - catch'],
			};
		}
		const response = await sheets.spreadsheets.values.append({
			spreadsheetId: file_id,
			range: effectiveRange,
			valueInputOption: 'RAW',
			insertDataOption: 'INSERT_ROWS',
			requestBody: { values },
		});

		if (!response.data.updates || !response.data.updates.updatedRange) {
			return {
				userMessage: 'No response from Google Sheets API!',
				error: 'No response from Google Sheets API!',
				errorType: 'InternalServerErrorException',
				errorData: {},
				trace: ['googleSheetsWriteExecute - catch'],
			};
		}

		const googleSheetLink = `https://docs.google.com/spreadsheets/d/${file_id}`;

		return { status: 'success', format: 'string', content: { defaultData: googleSheetLink } };
	} catch (error) {
		return {
			userMessage: 'Internal server error!',
			error: 'Internal server error!',
			errorType: 'InternalServerErrorException',
			errorData: {
				error: returnErrorString(error),
			},
			trace: ['googleSheetsWriteExecute - catch'],
		};
	}
};
