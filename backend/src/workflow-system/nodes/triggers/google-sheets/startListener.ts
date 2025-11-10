import axios from 'axios';
import { TriggerStartListenerPropsType } from 'src/workflow-system/workflow-system.type';
import { GoogleSheetsStartListenerConfigType, googleSheetsStartListenerValidate } from './validate';
import { googleSheetsStopListener } from './stopListener';
import { GoogleSheetsWebhookService } from 'src/shared/webhook/google-sheets/google-sheets-webhook.service';
import { DefaultReturnType } from 'src/shared/types/return.type';
import { returnErrorString } from 'src/shared/utils/return.util';
import { isError } from 'src/shared/utils/error.util';

export const googleSheetsStartListener = async ({
	triggerCallback,
	storeListener,
	...data
}: TriggerStartListenerPropsType<GoogleSheetsStartListenerConfigType>): Promise<
	DefaultReturnType<{ [key: string]: any }>
> => {
	try {
		const validate = await googleSheetsStartListenerValidate(data);
		if (isError(validate)) {
			return {
				...validate,
				trace: ['googleSheetsStartListener - validate'],
			};
		}

		const { userId, workflowId, triggerNodeId, config } = validate;
		const { auth_type, access_token, refresh_token, file_id } = config;

		const webhookUrl = `${process.env.BACKEND_URL}/workflow-system/google-sheets/${workflowId}/${triggerNodeId}`;

		const sheetsApiUrl = `https://sheets.googleapis.com/v4/spreadsheets/${file_id}`;

		try {
			await axios.get(sheetsApiUrl, {
				headers: { Authorization: `Bearer ${access_token}` },
			});
		} catch (sheetError) {
			const errorMessage = sheetError.response?.data?.error?.message || sheetError.message || 'Unknown error';
			return {
				userMessage: `Failed to access sheet: ${errorMessage}!`,
				error: `Failed to access sheet: ${errorMessage}!`,
				errorType: 'InternalServerErrorException',
				errorData: { errorMessage },
				trace: ['googleSheetsStartListener - try - catch'],
			};
		}

		const webAppUrl =
			'https://script.google.com/macros/s/AKfycbzANAW23xXs9r2TvENqUNuOYt3GT51kB8FNt4pzUYtyM4QUx9es9B8lAyFbPwp3hCc0/exec';

		try {
			const webAppResponse = await withRetries(
				() =>
					axios.get(webAppUrl, {
						params: {
							sheetId: file_id,
							webhookUrl: webhookUrl,
						},
					}),
				3,
				5000,
			);
			if (webAppResponse.data.includes('Error')) {
				throw new Error(webAppResponse.data);
			}
		} catch (webAppError) {
			const errorMessage = webAppError.response?.data || webAppError.message || 'Unknown error';

			return {
				userMessage: `Failed to set up triggers via web app: ${errorMessage}!`,
				error: `Failed to set up triggers via web app: ${errorMessage}!`,
				errorType: 'InternalServerErrorException',
				errorData: { errorMessage },
				trace: ['googleSheetsStartListener - try - catch'],
			};
		}

		const scriptId = webAppUrl.match(/\/s\/(.*?)\//)?.[1] || '';

		const listener = { file_id, access_token, scriptId };

		const response = await storeListener({
			triggerNodeId,
			triggerType: 'google-sheets',
			uniqueKey: triggerNodeId,
			listener,
		});
		if (isError(response)) {
			return { ...response, trace: ['googleSheetsStartListener - storeListener'] };
		}

		const handleWebhook = async (payload: any) => {
			await triggerCallback({
				userId,
				workflowId,
				data: JSON.stringify(payload),
				format: 'string',
				triggerDetails: {
					type: 'google-sheets',
					nodeId: triggerNodeId,
					file_id,
					access_token,
					refresh_token,
					webhook_url: webhookUrl,
					auth_type,
					range: payload.event === 'edit' ? payload.range : undefined,
				},
			});
		};

		await registerWebhookHandler(triggerNodeId, handleWebhook);

		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const shutdown = async (signal: string) => {
			await googleSheetsStopListener({ listener });
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
			userMessage: `Google Sheets Start Listener Error: ${errorMessage}!`,
			error: `Google Sheets Start Listener Error: ${errorMessage}!`,
			errorType: 'InternalServerErrorException',
			errorData: { errorMessage },
			trace: ['googleSheetsStartListener - catch'],
		};
	}
};

// Utility function for retries
async function withRetries<T>(fn: () => Promise<T>, maxRetries: number, delayMs: number): Promise<T> {
	let lastError: any;
	for (let attempt = 1; attempt <= maxRetries; attempt++) {
		try {
			return await fn();
		} catch (error) {
			lastError = error;

			// console.log(`Retry attempt ${attempt} failed:`, {
			// 	message: error.message,
			// 	status: error.response?.status,
			// 	data: error.response?.data,
			// 	headers: error.response?.headers,
			// });

			if (attempt < maxRetries) {
				await new Promise((resolve) => setTimeout(resolve, delayMs));
			}
		}
	}
	throw lastError;
}

async function registerWebhookHandler(triggerNodeId: string, handler: (payload: any) => Promise<void>) {
	const webhookService = new GoogleSheetsWebhookService();
	webhookService.registerHandler(triggerNodeId, handler);
}
