import { ToolMetadataType } from 'src/workflow-system/workflow-system.type';

export const tavilyToolMetadata: ToolMetadataType = {
	type: 'tavily-tool',
	label: 'Tavily Web Search',
	description: `Enable your agents to perform web searches with Tavily`,
	version: '1.0.0',
	category: 'Tool',
	icon: `${process.env.BACKEND_URL}/assets/node-images/tool-tavily.svg`,
};
