import { MetadataType } from 'src/workflow-system/workflow-system.type';

export const discordSendMetadata: MetadataType = {
	type: 'discord-send',
	label: 'Discord Send',
	description: 'Send messages to any Discord channel',
	version: '1.0.0',
	category: 'Action',
	icon: `${process.env.BACKEND_URL}/assets/node-images/discord-send.svg`,
};
