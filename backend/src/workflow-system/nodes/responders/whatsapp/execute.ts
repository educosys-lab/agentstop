import axios from 'axios';

import { WhatsAppResponderConfigType, WhatsAppResponderDataType, whatsappResponderValidate } from './validate';
import { ResponderNodePropsType, ResponderNodeReturnType } from 'src/workflow-system/workflow-system.type';
import { formatLLMResponseToText } from 'src/shared/utils/ai.util';
import { DefaultReturnType } from 'src/shared/types/return.type';
import { returnErrorString } from 'src/shared/utils/return.util';
import { isError } from 'src/shared/utils/error.util';

export const whatsappResponderExecute = async ({
	format,
	data,
	config,
}: ResponderNodePropsType<WhatsAppResponderDataType, WhatsAppResponderConfigType>): Promise<
	DefaultReturnType<ResponderNodeReturnType>
> => {
	try {
		const validate = await whatsappResponderValidate({ format, data, config });
		if (isError(validate)) {
			return {
				...validate,
				trace: [...validate.trace, 'whatsappResponderExecute - whatsappResponderValidate'],
			};
		}

		const { defaultData } = validate.data;
		const { access_token, phone_number_id, recipient_phone_number } = validate.config;

		const formattedData =
			typeof defaultData === 'string' ? formatLLMResponseToText(defaultData) : JSON.stringify(defaultData);
		if (isError(formattedData)) {
			return {
				...formattedData,
				trace: [...formattedData.trace, 'whatsappResponderExecute - formatLLMResponseToText'],
			};
		}

		const whatsappApiUrl = `https://graph.facebook.com/v20.0/${phone_number_id}/messages`;
		try {
			await axios.post(
				whatsappApiUrl,
				{
					messaging_product: 'whatsapp',
					to: recipient_phone_number,
					type: 'text',
					text: { body: formattedData },
				},
				{
					headers: { Authorization: `Bearer ${access_token}` },
				},
			);
		} catch (error) {
			const errorMessage = error.response?.data?.error?.message || error.message || 'Unknown error';
			return {
				userMessage: `Failed to send WhatsApp message: ${errorMessage}!`,
				error: `Failed to send WhatsApp message: ${errorMessage}!`,
				errorType: 'InternalServerErrorException',
				errorData: { errorMessage },
				trace: ['whatsappResponderExecute - try - catch'],
			};
		}

		return {
			status: 'success',
			format: 'string',
			content: { defaultData: 'Message sent to WhatsApp successfully' },
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
			trace: ['whatsappResponderExecute - catch'],
		};
	}
};
