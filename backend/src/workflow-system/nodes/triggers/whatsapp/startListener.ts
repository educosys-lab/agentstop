import axios from 'axios';

import { TriggerStartListenerPropsType } from 'src/workflow-system/workflow-system.type';
import { WhatsAppStartListenerConfigType, whatsappStartListenerValidate } from './validate';
import { DefaultReturnType } from 'src/shared/types/return.type';
import { returnErrorString } from 'src/shared/utils/return.util';
import { isError } from 'src/shared/utils/error.util';
import { whatsappStopListener } from './stopListener';

export const whatsappStartListener = async ({
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	triggerCallback,
	storeListener,
	...data
}: TriggerStartListenerPropsType<WhatsAppStartListenerConfigType>): Promise<DefaultReturnType<Record<string, any>>> => {
	try {
		const validate = await whatsappStartListenerValidate(data);
		if (isError(validate)) {
			console.error(`[WhatsAppStartListener] Validation error: ${JSON.stringify(validate, null, 2)}`);
			return {
				...validate,
				trace: ['whatsappStartListener - validate'],
			};
		}

		const { triggerNodeId, config } = validate;
		const { whatsapp_access_token, phone_number_id, verify_token } = config;

		// Verify access token
		const whatsappApiUrl = `https://graph.facebook.com/v20.0/${phone_number_id}`;
		try {
			await axios.get(whatsappApiUrl, {
				headers: { Authorization: `Bearer ${whatsapp_access_token}` },
			});
		} catch (apiError) {
			const errorMessage = apiError.response?.data?.error?.message || apiError.message || 'Unknown error';

			const userMessage = errorMessage.includes('Session has expired')
				? `WhatsApp access token has expired. Please generate a new permanent access token in the Meta Business Manager and update the mission configuration with the new token.`
				: `Failed to validate WhatsApp access token: ${errorMessage}!`;

			return {
				userMessage,
				error: `Failed to validate WhatsApp access token: ${errorMessage}!`,
				errorType: 'BadRequestException',
				errorData: { errorMessage },
				trace: ['whatsappStartListener - try - catch'],
			};
		}

		const listener = { whatsapp_access_token, phone_number_id, verify_token };

		const response = await storeListener({
			triggerNodeId,
			triggerType: 'whatsapp',
			uniqueKey: triggerNodeId,
			listener,
		});
		if (isError(response)) return { ...response, trace: ['whatsappStartListener - storeListener'] };

		// Handle process termination
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const shutdown = async (signal: string) => {
			await whatsappStopListener({ listener });
			process.exit(0);
		};

		// eslint-disable-next-line @typescript-eslint/no-misused-promises
		process.off('SIGINT', shutdown);
		// eslint-disable-next-line @typescript-eslint/no-misused-promises
		process.off('SIGTERM', shutdown);
		// eslint-disable-next-line @typescript-eslint/no-misused-promises
		process.on('SIGINT', () => shutdown('SIGINT'));
		// eslint-disable-next-line @typescript-eslint/no-misused-promises
		process.on('SIGTERM', () => shutdown('SIGTERM'));

		return {};
	} catch (error) {
		const errorMessage = returnErrorString(error);

		return {
			userMessage: `WhatsApp Start Listener Error: ${errorMessage}!`,
			error: `WhatsApp Start Listener Error: ${errorMessage}!`,
			errorType: 'InternalServerErrorException',
			errorData: { errorMessage, stack: error.stack },
			trace: ['whatsappStartListener - catch'],
		};
	}
};
