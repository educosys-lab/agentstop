import { NodeConfigType } from 'src/workflow-system/workflow-system.type';

export const slackSendConfig: NodeConfigType[] = [
	{
		name: 'bot_token',
		label: 'Bot Token',
		description: 'The Slack bot token for authentication.',
		type: 'text',
		placeholder: 'Enter your Slack bot token',
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
		description: 'The ID of the Slack channel to send messages to (e.g., C12345678).',
		type: 'text',
		placeholder: 'Enter the Slack channel ID',
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
