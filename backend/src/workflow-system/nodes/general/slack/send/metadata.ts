import { MetadataType } from 'src/workflow-system/workflow-system.type';

export const slackSendMetadata: MetadataType = {
	type: 'slack-send',
	label: 'Slack Send',
	description: 'Sends a message to a specified Slack channel.',
	version: '1.0.0',
	category: 'Action',
	icon: `${process.env.BACKEND_URL}/assets/node-images/slack-send.svg`,
};
