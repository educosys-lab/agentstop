import axios from 'axios';

import { HttpConfigType, HttpDataType, httpValidate } from './validate';
import { GeneralNodePropsType, GeneralNodeReturnType } from 'src/workflow-system/workflow-system.type';
import { DefaultReturnType } from 'src/shared/types/return.type';
import { returnErrorString } from 'src/shared/utils/return.util';
import { isError } from 'src/shared/utils/error.util';

export const httpExecute = async ({
	format,
	data,
	config,
}: GeneralNodePropsType<HttpDataType, HttpConfigType>): Promise<DefaultReturnType<GeneralNodeReturnType>> => {
	try {
		const validate = await httpValidate({
			format,
			data,
			config,
		});
		if (isError(validate)) {
			return {
				...validate,
				trace: [...validate.trace, 'httpExecute - httpValidate'],
			};
		}

		const { url, method, headers, body } = validate.config;

		const requestData: Record<string, string | object> = { url, method: method || 'GET' };
		if (headers) requestData.headers = headers;
		if (body) requestData.data = body;

		const response = await axios(requestData);

		return {
			status: 'success',
			format: 'json',
			content: { defaultData: JSON.stringify(response.data), status: response.status },
		};
	} catch (error) {
		return {
			userMessage: 'Internal server error!',
			error: 'Internal server error!',
			errorType: 'InternalServerErrorException',
			errorData: {
				error: returnErrorString(error),
			},
			trace: ['httpExecute - catch'],
		};
	}
};
