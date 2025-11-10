import axios from 'axios';
import { TriggerStopListenerPropsType } from 'src/workflow-system/workflow-system.type';
import { WhatsAppStopListenerDataType, whatsappStopListenerValidate } from './validate';
import { DefaultReturnType } from 'src/shared/types/return.type';
import { returnErrorString } from 'src/shared/utils/return.util';
import { isError } from 'src/shared/utils/error.util';

export const whatsappStopListener = async (
	data: TriggerStopListenerPropsType<WhatsAppStopListenerDataType>,
): Promise<DefaultReturnType<true>> => {
	try {
		const validate = await whatsappStopListenerValidate(data);
		if (isError(validate)) {
			return {
				...validate,
				trace: ['whatsappStopListener - validate'],
			};
		}

		const { listener } = validate;
		if (!listener || !listener.whatsapp_access_token || !listener.phone_number_id) {
			return {
				userMessage: 'No valid listener found to stop!',
				error: 'No valid listener found to stop!',
				errorType: 'InternalServerErrorException',
				errorData: { data },
				trace: ['whatsappStopListener - if (!listener || !listener.access_token || !listener.phone_number_id)'],
			};
		}

		// Unsubscribe webhook
		const webhookUnsubscribeUrl = `https://graph.facebook.com/v20.0/${listener.phone_number_id}/webhooks`;
		try {
			await axios.delete(webhookUnsubscribeUrl, {
				headers: { Authorization: `Bearer ${listener.whatsapp_access_token}` },
			});
		} catch (error) {
			const errorMessage = error.response?.data?.error?.message || error.message || 'Unknown error';
			return {
				userMessage: `Failed to unsubscribe WhatsApp webhook: ${errorMessage}!`,
				error: `Failed to unsubscribe WhatsApp webhook: ${errorMessage}!`,
				errorType: 'InternalServerErrorException',
				errorData: { errorMessage },
				trace: ['whatsappStopListener - try - catch'],
			};
		}

		return true;
	} catch (error) {
		return {
			userMessage: 'Failed to stop WhatsApp listener!',
			error: 'Failed to stop WhatsApp listener!',
			errorType: 'InternalServerErrorException',
			errorData: {
				error: returnErrorString(error),
			},
			trace: ['whatsappStopListener - catch'],
		};
	}
};
