import { ResponderMetadataType } from 'src/workflow-system/workflow-system.type';

export const telegramResponderMetadata: ResponderMetadataType = {
	type: 'telegram-responder',
	label: 'Telegram',
	description: `This node can be used to send messages to a Telegram chat.`,
	version: '1.0.0',
	category: 'Responder',
	icon: `${process.env.BACKEND_URL}/assets/node-images/responder-telegram.svg`,
	hidden: true,
};
