import { TriggerMetadataType } from 'src/workflow-system/workflow-system.type';

export const telegramTriggerMetadata: TriggerMetadataType = {
	type: 'telegram-trigger',
	label: 'Telegram',
	description: `Start mission on new Telegram messages`,
	version: '1.0.0',
	category: 'Trigger',
	icon: `${process.env.BACKEND_URL}/assets/node-images/trigger-telegram.svg`,
};
