import { ResponderMetadataType } from 'src/workflow-system/workflow-system.type';

export const slackResponderMetadata: ResponderMetadataType = {
	type: 'slack-responder',
	label: 'Slack',
	description: `This node can be used to send messages to a Slack channel in response to a trigger.`,
	version: '1.0.0',
	category: 'Responder',
	icon: `${process.env.BACKEND_URL}/assets/node-images/responder-slack.svg`,
	hidden: true,
};
