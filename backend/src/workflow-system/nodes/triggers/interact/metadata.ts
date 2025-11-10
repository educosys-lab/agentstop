import { TriggerMetadataType } from 'src/workflow-system/workflow-system.type';

export const interactTriggerMetadata: TriggerMetadataType = {
	type: 'interact-trigger',
	label: 'Chat',
	description: `Start mission from Agentstop chat window`,
	version: '1.0.0',
	category: 'Trigger',
	icon: `${process.env.BACKEND_URL}/assets/node-images/trigger-chat.svg`,
};
