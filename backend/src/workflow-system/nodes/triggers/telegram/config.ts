import { NodeConfigType } from 'src/workflow-system/workflow-system.type';

export const telegramTriggerConfig: NodeConfigType[] = [
	{
		name: 'accessToken',
		label: 'Access Token',
		description: {
			text: `Lets your bot read and send messages on Telegram. Open BotFather on Telegram, type /start, create a bot, and copy the token.`,
			url: 'https://t.me/BotFather',
		},
		type: 'text',
		placeholder: 'Enter your access token',
		validation: [
			{ field: 'accessToken', label: 'Access token', type: 'string', required: true, isSensitiveData: true },
		],
	},
];
