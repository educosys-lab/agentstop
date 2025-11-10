import { ResponderMetadataType } from 'src/workflow-system/workflow-system.type';

export const interactResponderMetadata: ResponderMetadataType = {
	type: 'interact-responder',
	label: 'Interact',
	description: `This node can be used to send messages to Agentstop chat.`,
	version: '1.0.0',
	category: 'Responder',
	icon: `${process.env.BACKEND_URL}/assets/node-images/responder-chat.svg`,
	hidden: true,
};
