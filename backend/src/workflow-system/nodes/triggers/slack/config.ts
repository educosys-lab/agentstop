import { NodeConfigType } from 'src/workflow-system/workflow-system.type';
import { triggerMessageTypeOptions } from './slack.data';

export const slackTriggerConfig: NodeConfigType[] = [
	{
		name: 'bot_token',
		label: 'Bot Token',
		description: 'The token of your Slack bot, obtained from the Slack API (Bot User OAuth Token).',
		type: 'text',
		placeholder: 'Enter your Slack bot token (xoxb-...)',
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
		name: 'app_token',
		label: 'App Token',
		description: 'The app-level token for Socket Mode, obtained from the Slack API.',
		type: 'text',
		placeholder: 'Enter your Slack app token (xapp-...)',
		validation: [
			{
				field: 'app_token',
				label: 'App token',
				type: 'string',
				required: true,
				isSensitiveData: true,
			},
		],
	},
	{
		name: 'trigger_type',
		label: 'Trigger Type',
		description: 'Select the type of messages to trigger the workflow.',
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
