import { ResponderMetadataType } from 'src/workflow-system/workflow-system.type';

export const webhookResponderMetadata: ResponderMetadataType = {
	type: 'webhook-responder',
	label: 'Webhook',
	description: `This node can be used to send messages to webhook.`,
	version: '1.0.0',
	category: 'Responder',
	icon: `${process.env.BACKEND_URL}/assets/node-images/responder-webhook.svg`,
	hidden: true,
};
