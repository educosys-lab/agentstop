import { NodeConfigType } from 'src/workflow-system/workflow-system.type';

export const discordToolConfig: NodeConfigType[] = [
	{
		name: 'BOT_TOKEN',
		label: 'Discord Bot Token',
		description: {
			text: `Used to connect your bot to Discord. Create a bot in the Discord Developer Portal and copy the token from the Bot section.`,
			url: 'https://discord.com/developers/applications',
		},
		type: 'text',
		placeholder: 'Enter the bot token (e.g., NzI0MTk2NjQyMTQ3NzI0OTY2.Xu8z9w.abcdefg)',
		validation: [
			{
				field: 'BOT_TOKEN',
				label: 'Discord Bot Token',
				type: 'string',
				required: true,
				isSensitiveData: true,
			},
		],
	},
	{
		name: 'CHANNEL_ID',
		label: 'Discord Channel ID',
		description: {
			text: `Used to select the channel where your bot can read messages and send responses. Turn on Developer Mode in Discord settings, right-click the channel, and select Copy Channel ID.`,
			url: 'https://support.discord.com/hc/en-us/articles/206346498',
		},
		type: 'text',
		placeholder: 'Enter the channel ID (e.g., 123456789012345678)',
		validation: [
			{
				field: 'CHANNEL_ID',
				label: 'Discord Channel ID',
				type: 'string',
				required: true,
				isSensitiveData: false,
			},
		],
	},
];
