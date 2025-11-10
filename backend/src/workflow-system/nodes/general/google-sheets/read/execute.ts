import { google } from 'googleapis';
import { sheets_v4 } from 'googleapis/build/src/apis/sheets/v4';

import { GoogleSheetsReadConfigType, GoogleSheetsReadDataType, googleSheetsReadValidate } from './validate';
import { GeneralNodePropsType, GeneralNodeReturnType } from 'src/workflow-system/workflow-system.type';
import { DefaultReturnType } from 'src/shared/types/return.type';
import { returnErrorString } from 'src/shared/utils/return.util';
import { isError } from 'src/shared/utils/error.util';

export const googleSheetsReadExecute = async ({
	format,
	data,
	config,
}: GeneralNodePropsType<GoogleSheetsReadDataType, GoogleSheetsReadConfigType>): Promise<
	DefaultReturnType<GeneralNodeReturnType>
> => {
	try {
		const validate = await googleSheetsReadValidate({
			format,
			data,
			config,
		});
		if (isError(validate)) {
			return {
				...validate,
				trace: [...validate.trace, 'googleSheetsReadExecute - googleSheetsReadValidate'],
			};
		}

		const { access_token, file_id, range } = validate.config;

		const trimmedRange = range ? range.replace(/\s+/g, '') : '';

		const oauth2Client = new google.auth.OAuth2();
		oauth2Client.setCredentials({ access_token });

		const sheets: sheets_v4.Sheets = google.sheets({ version: 'v4', auth: oauth2Client });

		const MAX_ROWS = 500;
		const MAX_COLS = 500;
		const lastColumnLetter = getColumnLetter(MAX_COLS);

		const response = await (
			trimmedRange
				? sheets.spreadsheets.values.get({ spreadsheetId: file_id, range: trimmedRange })
				: sheets.spreadsheets.get({ spreadsheetId: file_id }).then(async (sheetInfo) => {
						const sheetNames =
							sheetInfo.data.sheets
								?.map((sheet) => sheet.properties?.title)
								.filter((title): title is string => !!title) || [];
						const allValues: any[] = [];

						for (const sheetName of sheetNames) {
							const defaultRange = `${sheetName}!A1:${lastColumnLetter}${MAX_ROWS}`;
							const sheetData = await sheets.spreadsheets.values.get({
								spreadsheetId: file_id,
								range: defaultRange,
							});
							if (sheetData.data?.values) {
								const trimmedValues = sheetData.data.values
									.slice(0, MAX_ROWS)
									.map((row) => row.slice(0, MAX_COLS));
								allValues.push(...trimmedValues);
							}
						}
						return { data: { values: allValues } };
					})
		).catch((error) => {
			return {
				userMessage: 'Error fetching data from Google Sheets!',
				error: 'Error fetching data from Google Sheets!',
				errorType: 'InternalServerErrorException',
				errorData: {
					error: returnErrorString(error),
				},
				trace: ['googleSheetsReadExecute - catch'],
			};
		});

		if (!response || typeof (response as any).data === 'string') {
			return {
				userMessage: 'No data found!',
				error: 'No data found!',
				errorType: 'InternalServerErrorException',
				errorData: {},
				trace: ['googleSheetsReadExecute - catch'],
			};
		}

		const values = ((response as any).data.values || []).slice(0, MAX_ROWS).map((row) => row.slice(0, MAX_COLS));

		const content = values.map((row: any) => row.join(',')).join('\n') || 'No data available';

		return { status: 'success', format: 'string', content: { defaultData: content } };
	} catch (error) {
		return {
			userMessage: 'Internal server error!',
			error: 'Internal server error!',
			errorType: 'InternalServerErrorException',
			errorData: {
				error: returnErrorString(error),
			},
			trace: ['googleSheetsReadExecute - catch'],
		};
	}
};

function getColumnLetter(col: number): string {
	let letter = '';
	while (col > 0) {
		const remainder = (col - 1) % 26;
		letter = String.fromCharCode(65 + remainder) + letter;
		col = Math.floor((col - 1) / 26);
	}
	return letter;
}
