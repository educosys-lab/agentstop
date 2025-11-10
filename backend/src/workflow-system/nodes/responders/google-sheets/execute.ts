import { google } from 'googleapis';
import {
	GoogleSheetsResponderConfigType,
	GoogleSheetsResponderDataType,
	googleSheetsResponderValidate,
} from './validate';
import { ResponderNodePropsType, ResponderNodeReturnType } from 'src/workflow-system/workflow-system.type';
import { formatLLMResponseToText } from 'src/shared/utils/ai.util';
import { DefaultReturnType } from 'src/shared/types/return.type';
import { returnErrorString } from 'src/shared/utils/return.util';
import { isError } from 'src/shared/utils/error.util';

export const googleSheetsResponderExecute = async ({
	format,
	data,
	config,
}: ResponderNodePropsType<GoogleSheetsResponderDataType, GoogleSheetsResponderConfigType>): Promise<
	DefaultReturnType<ResponderNodeReturnType>
> => {
	try {
		const validate = await googleSheetsResponderValidate({ format, data, config });
		if (isError(validate)) {
			return {
				...validate,
				trace: [...validate.trace, 'googleSheetsResponderExecute - googleSheetsResponderValidate'],
			};
		}

		const { defaultData } = validate.data;
		const { access_token, refresh_token, file_id } = validate.config;

		const formattedData =
			typeof defaultData === 'string' ? formatLLMResponseToText(defaultData) : JSON.stringify(defaultData);
		if (isError(formattedData)) {
			return {
				...formattedData,
				trace: [...formattedData.trace, 'googleSheetsResponderExecute - formatLLMResponseToText'],
			};
		}

		const oauth2Client = new google.auth.OAuth2({
			clientId: process.env.GOOGLE_CLIENT_ID,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET,
			redirectUri: 'urn:ietf:wg:oauth:2.0:oob',
		});
		oauth2Client.setCredentials({ access_token, refresh_token });

		const sheets = google.sheets({ version: 'v4', auth: oauth2Client });
		const getRows = await sheets.spreadsheets.values.get({
			spreadsheetId: file_id,
			range: 'Sheet1!A:A',
		});
		const numRows = getRows.data.values ? getRows.data.values.length : 0;

		const targetRange = `Sheet1!A${numRows + 1}`;

		const values = [[formattedData]];
		await sheets.spreadsheets.values.update({
			spreadsheetId: file_id,
			range: targetRange,
			valueInputOption: 'RAW',
			requestBody: { values },
		});

		return {
			status: 'success',
			format: 'string',
			content: { defaultData: 'Data written to Google Sheet successfully' },
		};
	} catch (error) {
		return {
			userMessage: 'Internal server error!',
			error: 'Internal server error!',
			errorType: 'InternalServerErrorException',
			errorData: {
				format,
				data,
				config,
				error: returnErrorString(error),
			},
			trace: ['googleSheetsResponderExecute - catch'],
		};
	}
};
