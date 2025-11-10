import { App } from '@slack/bolt';

import { TriggerStartListenerPropsType } from 'src/workflow-system/workflow-system.type';
import { SlackStartListenerConfigType, slackStartListenerValidate } from './validate';
import { DefaultReturnType } from 'src/shared/types/return.type';
import { TIME } from 'src/shared/constants/time.constant';
import { returnErrorString } from 'src/shared/utils/return.util';
import { isError } from 'src/shared/utils/error.util';

export const slackStartListener = async ({
	triggerCallback,
	storeListener,
	...data
}: TriggerStartListenerPropsType<SlackStartListenerConfigType>): Promise<DefaultReturnType<{ [key: string]: any }>> => {
	try {
		const validate = await slackStartListenerValidate(data);
		if (isError(validate)) {
			return {
				...validate,
				trace: ['slackStartListener - validate'],
			};
		}

		const { userId, workflowId, triggerNodeId, config } = validate;
		const { bot_token, app_token, trigger_type } = config;

		if (!bot_token) {
			return {
				userMessage: 'Bot token is missing in configuration!',
				error: 'Bot token is missing in configuration!',
				errorType: 'InternalServerErrorException',
				errorData: { config },
				trace: ['slackStartListener - if (!bot_token)'],
			};
		}

		if (!app_token) {
			return {
				userMessage: 'App token is missing in configuration!',
				error: 'App token is missing in configuration!',
				errorType: 'InternalServerErrorException',
				errorData: { config },
				trace: ['slackStartListener - if (!app_token)'],
			};
		}

		const app = new App({
			token: bot_token,
			appToken: app_token,
			socketMode: true,
		});

		const processedMessages = new Map<string, number>();
		let botId: string | null = null;

		try {
			const response = await app.client.auth.test({ token: bot_token });
			botId = response.user_id || null;
		} catch (error) {
			return {
				userMessage: 'Failed to fetch bot user ID!',
				error: 'Failed to fetch bot user ID!',
				errorType: 'InternalServerErrorException',
				errorData: {
					error: returnErrorString(error),
				},
				trace: ['slackStartListener - try - catch'],
			};
		}

		const isDuplicate = (ts: string) => {
			const now = Date.now();
			if (processedMessages.has(ts)) return true;

			processedMessages.set(ts, now);
			return false;
		};

		setInterval(() => {
			const now = Date.now();
			for (const [ts, timestamp] of processedMessages.entries()) {
				if (now - timestamp > 10 * TIME.MINUTE_IN_MS) processedMessages.delete(ts);
			}
		}, 10 * TIME.MINUTE_IN_MS);

		const handleMessage = async (event: any) => {
			const messageEvent = event.body?.event || event.payload;
			if (!messageEvent) {
				return;
			}

			const { text, ts, channel, bot_id } = messageEvent;

			if (bot_id || isDuplicate(ts)) {
				return;
			}

			let shouldTrigger = false;
			if (trigger_type === 'all_messages') {
				if (botId && !text?.includes(`<@${botId}>`)) {
					shouldTrigger = true;
				}
			} else if (trigger_type === 'tagged_messages' && botId) {
				if (text?.includes(`<@${botId}>`)) {
					shouldTrigger = true;
				}
			}

			if (!shouldTrigger) {
				return;
			}

			await triggerCallback({
				userId,
				workflowId,
				data: text,
				format: 'string',
				triggerDetails: {
					type: 'slack',
					nodeId: triggerNodeId,
					channel_id: channel,
					bot_token,
					trigger_type,
					ts,
				},
			});
		};

		app.message(debounce(handleMessage, 100));

		await app.start();

		const response = await storeListener({
			triggerNodeId,
			triggerType: 'slack',
			uniqueKey: triggerNodeId,
			listener: app,
		});
		if (isError(response)) {
			await app.stop();
			return { ...response, trace: ['slackStartListener - storeListener'] };
		}

		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const shutdown = async (signal: string) => {
			await app.stop();
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

		// setInterval(() => {
		// 	console.log('Heartbeat: Slack WebSocket is active', {
		// 		uptime: process.uptime(),
		// 		memory: process.memoryUsage().rss,
		// 	});
		// }, 30 * DATA.MINUTE_IN_MS);

		return {};
	} catch (error) {
		return {
			userMessage: 'Failed to start Slack listener!',
			error: 'Failed to start Slack listener!',
			errorType: 'InternalServerErrorException',
			errorData: {
				error: returnErrorString(error),
			},
			trace: ['slackStartListener - catch'],
		};
	}
};

function debounce<T extends (...args: any[]) => Promise<void>>(func: T, wait: number) {
	let timeout: NodeJS.Timeout | null = null;

	return async (...args: Parameters<T>): Promise<void> => {
		if (timeout) clearTimeout(timeout);
		// eslint-disable-next-line @typescript-eslint/no-misused-promises
		timeout = setTimeout(async () => {
			timeout = null;
			await func(...args);
		}, wait);
	};
}
