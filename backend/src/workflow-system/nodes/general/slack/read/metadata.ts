import { MetadataType } from 'src/workflow-system/workflow-system.type';

export const slackReadMetadata: MetadataType = {
	type: 'slack-read',
	label: 'Slack Read',
	description: 'Reads messages from a specified Slack channel.',
	version: '1.0.0',
	category: 'Action',
	icon: `${process.env.BACKEND_URL}/assets/node-images/slack-read.svg`,
};
