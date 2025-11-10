import { NodeConfigType } from 'src/workflow-system/workflow-system.type';

export const slackToolConfig: NodeConfigType[] = [
	{
		name: 'SLACK_BOT_TOKEN',
		label: 'Slack Bot Token',
		description: 'Slack Bot Token for authentication and to access the Slack API.',
		type: 'text',
		placeholder: 'Enter the bot token (e.g., xoxb-your-bot-token)',
		validation: [
			{
				field: 'SLACK_BOT_TOKEN',
				label: 'Slack Bot Token',
				type: 'string',
				required: true,
				isSensitiveData: true,
			},
		],
	},
	{
		name: 'SLACK_TEAM_ID',
		label: 'Slack Team ID',
		description: 'The Slack Team ID for the workspace where the bot operates.',
		type: 'text',
		placeholder: 'Enter the team ID (e.g., T01234567)',
		validation: [
			{
				field: 'SLACK_TEAM_ID',
				label: 'Slack Team ID',
				type: 'string',
				required: true,
				isSensitiveData: false,
			},
		],
	},
	{
		name: 'SLACK_CHANNEL_IDS',
		label: 'Slack Channel IDs',
		description: 'Comma-separated list of Slack Channel IDs for the bot to interact with.',
		type: 'text',
		placeholder: 'Enter channel IDs (e.g., C01234567,C76543210)',
		validation: [
			{
				field: 'SLACK_CHANNEL_IDS',
				label: 'Slack Channel IDs',
				type: 'string',
				required: true,
				isSensitiveData: false,
			},
		],
	},
];
