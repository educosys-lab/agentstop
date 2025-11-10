import { Client, IntentsBitField, Message, OmitPartialGroupDMChannel } from 'discord.js';

import { DiscordStartListenerConfigType, discordStartListenerValidate } from './validate';
import { TriggerStartListenerPropsType } from 'src/workflow-system/workflow-system.type';
import { DefaultReturnType } from 'src/shared/types/return.type';
import { TIME } from 'src/shared/constants/time.constant';
import { returnErrorString } from 'src/shared/utils/return.util';
import { isError } from 'src/shared/utils/error.util';

export const discordStartListener = async ({
	triggerCallback,
	storeListener,
	...data
}: TriggerStartListenerPropsType<DiscordStartListenerConfigType>): Promise<
	DefaultReturnType<{ [key: string]: any }>
> => {
	try {
		const validate = await discordStartListenerValidate(data);
		if (isError(validate)) {
			return {
				...validate,
				trace: ['discordStartListener - validate'],
			};
		}

		const { userId, workflowId, triggerNodeId, config } = validate;
		const { bot_token, trigger_type } = config;

		if (!bot_token) {
			return {
				userMessage: 'Bot token is missing in configuration!',
				error: 'Bot token is missing in configuration!',
				errorType: 'InternalServerErrorException',
				errorData: { data },
				trace: ['discordStartListener - if (!bot_token)'],
			};
		}

		const client = new Client({
			intents: [
				IntentsBitField.Flags.Guilds,
				IntentsBitField.Flags.GuildMessages,
				IntentsBitField.Flags.MessageContent,
			],
		});

		const processedMessages = new Map<string, number>();
		let botId: string | null = null;

		client.once('ready', () => (botId = client.user?.id || null));

		const isDuplicate = (id: string) => {
			const now = Date.now();
			if (processedMessages.has(id)) return true;

			processedMessages.set(id, now);
			return false;
		};

		setInterval(() => {
			const now = Date.now();
			for (const [id, ts] of processedMessages.entries()) {
				if (now - ts > 10 * TIME.MINUTE_IN_MS) processedMessages.delete(id);
			}
		}, 10 * TIME.MINUTE_IN_MS);

		const handleMessage = async (message: OmitPartialGroupDMChannel<Message<boolean>>) => {
			if (message.author.bot || isDuplicate(message.id)) return;

			let shouldTrigger = false;
			if (trigger_type === 'all_messages') {
				if (botId && !message.mentions.users.has(botId)) shouldTrigger = true;
			} else if (trigger_type === 'tagged_messages' && botId) {
				shouldTrigger = message.mentions.users.has(botId);
			}

			if (!shouldTrigger) return;

			await triggerCallback({
				userId,
				workflowId,
				data: message.content,
				format: 'string',
				triggerDetails: {
					type: 'discord',
					nodeId: triggerNodeId,
					channel_id: message.channelId,
					bot_token,
					trigger_type,
					message_id: message.id,
				},
			});
		};

		if (client.listenerCount('messageCreate') === 0) {
			client.on('messageCreate', debounce(handleMessage, 100));
		}

		// client.on('shardDisconnect', (event, shardId) => {
		// 	console.log('shardDisconnect', event, shardId);
		// });

		// client.on('shardError', (error, shardId) => {
		// 	console.log('shardError', error, shardId);
		// });

		// client.on('reconnecting', () => {
		// 	console.log('reconnecting', triggerNodeId);
		// });

		await client.login(bot_token);

		const response = await storeListener({
			triggerNodeId,
			triggerType: 'discord',
			uniqueKey: triggerNodeId,
			listener: client,
		});
		if (isError(response)) {
			return { ...response, trace: ['discordStartListener - if (isObject(response) && "error" in response)'] };
		}

		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const shutdown = async (signal: string) => {
			await client.destroy();
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
		// 	console.log('Heartbeat: Discord WebSocket is active', {
		// 		uptime: process.uptime(),
		// 		memory: process.memoryUsage().rss,
		// 	});
		// }, 30 * DATA.MINUTE_IN_MS);

		return {};
	} catch (error) {
		return {
			userMessage: 'Failed to start Discord listener!',
			error: 'Failed to start Discord listener!',
			errorType: 'InternalServerErrorException',
			errorData: {
				error: returnErrorString(error),
			},
			trace: ['discordStartListener - catch'],
		};
	}
};

function debounce<T extends (...args: any[]) => void>(func: T, wait: number) {
	let timeout: NodeJS.Timeout | null = null;

	return (...args: Parameters<T>) => {
		if (timeout) clearTimeout(timeout);
		timeout = setTimeout(() => {
			timeout = null;
			func(...args);
		}, wait);
	};
}
