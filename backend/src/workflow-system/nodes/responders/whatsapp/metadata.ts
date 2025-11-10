import { ResponderMetadataType } from 'src/workflow-system/workflow-system.type';

export const whatsappResponderMetadata: ResponderMetadataType = {
	type: 'whatsapp-responder',
	label: 'WhatsApp',
	description: 'Send a message to a specified phone number via WhatsApp Cloud API.',
	version: '1.0.0',
	category: 'Responder',
	icon: `${process.env.BACKEND_URL}/assets/node-images/responder-whatsapp.svg`,
	hidden: true,
};
