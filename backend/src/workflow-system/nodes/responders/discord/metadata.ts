import { ResponderMetadataType } from 'src/workflow-system/workflow-system.type';

export const discordResponderMetadata: ResponderMetadataType = {
	type: 'discord-responder',
	label: 'Discord',
	description: `This node can be used to receive messages from a Discord channel. It can be used to trigger workflows based on incoming messages. The messages are in string format.`,
	version: '1.0.0',
	category: 'Responder',
	icon: `${process.env.BACKEND_URL}/assets/node-images/responder-discord.svg`,
	hidden: true,
};
