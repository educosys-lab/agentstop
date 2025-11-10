import { Telegraf } from 'telegraf';

import { TelegramStartListenerConfigType, telegramStartListenerValidate } from './validate';
import { TriggerStartListenerPropsType } from 'src/workflow-system/workflow-system.type';
import { DefaultReturnType } from 'src/shared/types/return.type';
import { returnErrorString } from 'src/shared/utils/return.util';
import { isError } from 'src/shared/utils/error.util';

export const telegramStartListener = async ({
	triggerCallback,
	storeListener,
	...data
}: TriggerStartListenerPropsType<TelegramStartListenerConfigType>): Promise<
	DefaultReturnType<{ [key: string]: any }>
> => {
	try {
		const validate = await telegramStartListenerValidate(data);
		if (isError(validate)) {
			return {
				...validate,
				trace: ['telegramStartListener - validate'],
			};
		}

		const { userId, workflowId, triggerNodeId, config } = validate;
		const { accessToken } = config;

		const bot = new Telegraf(accessToken);

		bot.on('message', async (ctx) => {
			await triggerCallback({
				userId,
				workflowId,
				data: ctx.text,
				format: 'string',
				triggerDetails: {
					type: 'telegram',
					nodeId: triggerNodeId,
					chatId: ctx.chat.id,
					accessToken,
				},
			});
		});

		bot.catch((error) => console.error('Telegraf caught error:', error));

		const webhookUrl = `${process.env.BACKEND_URL}/webhook/telegram/${accessToken}`;
		await bot.telegram.setWebhook(webhookUrl);

		const response = await storeListener({
			triggerNodeId,
			triggerType: 'telegram',
			uniqueKey: accessToken,
			listener: bot,
		});
		if (isError(response)) {
			return { ...response, trace: ['telegramStartListener - storeListener'] };
		}

		return {};
	} catch (error) {
		return {
			userMessage: 'Failed to start Telegram listener!',
			error: 'Failed to start Telegram listener!',
			errorType: 'InternalServerErrorException',
			errorData: {
				error: returnErrorString(error),
			},
			trace: ['telegramStartListener - catch'],
		};
	}
};
