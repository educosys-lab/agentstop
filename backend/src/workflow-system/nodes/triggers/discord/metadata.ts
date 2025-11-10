import { TriggerMetadataType } from 'src/workflow-system/workflow-system.type';

export const discordTriggerMetadata: TriggerMetadataType = {
	type: 'discord-trigger',
	label: 'Discord',
	description: `Start mission on new Discord messages`,
	version: '1.0.0',
	category: 'Trigger',
	icon: `${process.env.BACKEND_URL}/assets/node-images/trigger-discord.svg`,
};
