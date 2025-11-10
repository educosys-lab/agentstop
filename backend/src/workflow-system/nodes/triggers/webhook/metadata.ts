import { TriggerMetadataType } from 'src/workflow-system/workflow-system.type';

export const webhookTriggerMetadata: TriggerMetadataType = {
	type: 'webhook-trigger',
	label: 'Webhook',
	description: `Start mission from webhook`,
	version: '1.0.0',
	category: 'Trigger',
	icon: `${process.env.BACKEND_URL}/assets/node-images/trigger-webhook.svg`,
};
