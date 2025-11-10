import { ToolMetadataType } from 'src/workflow-system/workflow-system.type';

export const whatsappToolMetadata: ToolMetadataType = {
	type: 'whatsapp-tool',
	label: 'WhatsApp',
	description: `Enable your agents to interact with WhatsApp users using the Business API`,
	version: '1.0.0',
	category: 'Tool',
	icon: `${process.env.BACKEND_URL}/assets/node-images/tool-whatsapp.svg`,
};
