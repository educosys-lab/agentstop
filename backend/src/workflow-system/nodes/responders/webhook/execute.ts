import { WebhookResponderConfigType, WebhookResponderDataType, webhookResponderValidate } from './validate';
import { ResponderNodePropsType, ResponderNodeReturnType } from 'src/workflow-system/workflow-system.type';
import { DefaultReturnType } from 'src/shared/types/return.type';
import { returnErrorString } from 'src/shared/utils/return.util';
import { isError } from 'src/shared/utils/error.util';

export const webhookResponderExecute = async ({
	format,
	data,
	config,
}: ResponderNodePropsType<WebhookResponderDataType, WebhookResponderConfigType>): Promise<
	DefaultReturnType<ResponderNodeReturnType>
> => {
	try {
		const validate = await webhookResponderValidate({ format, data, config });
		if (isError(validate)) {
			return {
				...validate,
				trace: [...validate.trace, 'webhookResponderExecute - webhookResponderValidate'],
			};
		}

		const { defaultData, sendResponse } = validate.data;
		const { requestId } = validate.config;

		const formattedDefaultData = typeof defaultData === 'string' ? defaultData : JSON.stringify(defaultData);

		const response = await sendResponse({
			requestId,
			data: formattedDefaultData,
			statusCode: 200,
		});

		if (isError(response)) {
			return {
				...response,
				trace: [...response.trace, 'webhookResponderExecute - sendResponse'],
			};
		}

		return {
			status: 'success',
			format: 'string',
			content: { defaultData: 'Message sent successfully' },
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
			trace: ['webhookResponderExecute - catch'],
		};
	}
};
