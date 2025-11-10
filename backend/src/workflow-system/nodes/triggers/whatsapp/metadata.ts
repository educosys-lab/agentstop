import { TriggerMetadataType } from 'src/workflow-system/workflow-system.type';

export const whatsappTriggerMetadata: TriggerMetadataType = {
	type: 'whatsapp-trigger',
	label: 'WhatsApp',
	description: 'Start mission on sending a new message on WhatsApp',
	version: '1.0.0',
	category: 'Trigger',
	icon: `${process.env.BACKEND_URL}/assets/node-images/trigger-whatsapp.svg`,
};
