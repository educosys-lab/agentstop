import { ToolMetadataType } from 'src/workflow-system/workflow-system.type';

export const notionToolMetadata: ToolMetadataType = {
	type: 'notion-tool',
	label: 'Notion',
	description: `Enable your agents to manage Notion data`,
	version: '1.0.0',
	category: 'Tool',
	icon: `${process.env.BACKEND_URL}/assets/node-images/tool-notion.svg`,
};
