import { ResponderMetadataType } from 'src/workflow-system/workflow-system.type';

export const defaultResponderMetadata: ResponderMetadataType = {
	type: 'default-responder',
	label: 'Responder',
	description: `Respond to the mission trigger`,
	version: '1.0.0',
	category: 'Responder',
	icon: `${process.env.BACKEND_URL}/assets/node-images/responder-default.svg`,
};
