import { MetadataType } from 'src/workflow-system/workflow-system.type';

export const discordReadMetadata: MetadataType = {
	type: 'discord-read',
	label: 'Discord Read',
	description: 'Read messages from any Discord channel',
	version: '1.0.0',
	category: 'Action',
	icon: `${process.env.BACKEND_URL}/assets/node-images/discord-read.svg`,
};
