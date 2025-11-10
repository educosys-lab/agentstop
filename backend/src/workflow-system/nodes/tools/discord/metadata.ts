import { ToolMetadataType } from 'src/workflow-system/workflow-system.type';

export const discordToolMetadata: ToolMetadataType = {
	type: 'discord-tool',
	label: 'Discord',
	description: `Enable your agents to interact with Discord channels`,
	version: '1.0.0',
	category: 'Tool',
	icon: `${process.env.BACKEND_URL}/assets/node-images/tool-discord.svg`,
};
