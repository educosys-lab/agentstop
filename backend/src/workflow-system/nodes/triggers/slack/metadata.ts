import { TriggerMetadataType } from 'src/workflow-system/workflow-system.type';

export const slackTriggerMetadata: TriggerMetadataType = {
	type: 'slack-trigger',
	label: 'Slack',
	description: `Start mission on new Slack messages`,
	version: '1.0.0',
	category: 'Trigger',
	icon: `${process.env.BACKEND_URL}/assets/node-images/trigger-slack.svg`,
};
