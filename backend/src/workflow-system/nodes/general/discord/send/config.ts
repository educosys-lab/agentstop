import { NodeConfigType } from 'src/workflow-system/workflow-system.type';

export const discordSendConfig: NodeConfigType[] = [
	{
		name: 'bot_token',
		label: 'Bot Token',
		description: {
			text: `Used to connect your bot to Discord. Create a bot in the Discord Developer Portal and copy the token from the Bot section.`,
			url: 'https://discord.com/developers/applications',
		},
		type: 'text',
		placeholder: 'Enter your Discord bot token',
		validation: [
			{
				field: 'bot_token',
				label: 'Bot Token',
				type: 'string',
				required: true,
				isSensitiveData: true,
			},
		],
	},
	{
		name: 'channel_id',
		label: 'Channel ID',
		description: {
			text: `Used to choose which channel the bot sends messages to. Turn on Developer Mode in Discord settings, right-click the channel, and select Copy Channel ID.`,
			url: 'https://support.discord.com/hc/en-us/articles/206346498',
		},
		type: 'text',
		placeholder: 'Enter the Discord channel ID',
		validation: [
			{
				field: 'channel_id',
				label: 'Channel ID',
				type: 'string',
				required: true,
			},
		],
	},
];
