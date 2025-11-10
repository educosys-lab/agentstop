import { NodeConfigType } from 'src/workflow-system/workflow-system.type';
import { triggerMessageTypeOptions } from './discord.data';

export const discordTriggerConfig: NodeConfigType[] = [
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
				label: 'Bot token',
				type: 'string',
				required: true,
				isSensitiveData: true,
			},
		],
	},
	{
		name: 'trigger_type',
		label: 'Trigger Type',
		description: {
			text: `Used to choose which channel the bot reads messages from. Turn on Developer Mode in Discord settings, right-click the channel, and select Copy Channel ID.`,
			url: 'https://support.discord.com/hc/en-us/articles/206346498',
		},
		type: 'select',
		placeholder: 'Select trigger type',
		defaultValue: 'all_messages',
		options: triggerMessageTypeOptions,
		validation: [
			{
				field: 'trigger_type',
				label: 'Trigger type',
				type: 'string',
				required: true,
				validValues: triggerMessageTypeOptions.map((option) => option.value),
			},
		],
	},
];
