import axios from 'axios';
import { TriggerStopListenerPropsType } from 'src/workflow-system/workflow-system.type';
import { GoogleSheetsStopListenerDataType, googleSheetsStopListenerValidate } from './validate';
import { DefaultReturnType } from 'src/shared/types/return.type';
import { returnErrorString } from 'src/shared/utils/return.util';
import { isError } from 'src/shared/utils/error.util';

export const googleSheetsStopListener = async (
	data: TriggerStopListenerPropsType<GoogleSheetsStopListenerDataType>,
): Promise<DefaultReturnType<true>> => {
	try {
		const validate = await googleSheetsStopListenerValidate(data);
		if (isError(validate)) {
			return {
				...validate,
				trace: ['googleSheetsStopListener - validate'],
			};
		}

		const { listener } = validate;
		if (!listener || !listener.scriptId || !listener.access_token) {
			return {
				userMessage: 'No valid listener found to stop!',
				error: 'No valid listener found to stop!',
				errorType: 'InternalServerErrorException',
				errorData: { data },
				trace: ['googleSheetsStopListener - if (!listener || !listener.scriptId || !listener.access_token)'],
			};
		}

		const disableTriggersUrl = `https://script.google.com/macros/s/${listener.scriptId}/exec?action=disable&sheetId=${listener.file_id}`;
		await axios.get(disableTriggersUrl);

		return true;
	} catch (error) {
		return {
			userMessage: 'Failed to stop Google Sheets listener!',
			error: 'Failed to stop Google Sheets listener!',
			errorType: 'InternalServerErrorException',
			errorData: {
				error: returnErrorString(error),
			},
			trace: ['googleSheetsStopListener - catch'],
		};
	}
};
