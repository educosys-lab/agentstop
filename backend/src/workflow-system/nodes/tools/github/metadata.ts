import { ToolMetadataType } from 'src/workflow-system/workflow-system.type';

export const gitHubToolMetadata: ToolMetadataType = {
	type: 'github-tool',
	label: 'GitHub',
	description: `Enable your agents to manage GitHub data`,
	version: '1.0.0',
	category: 'Tool',
	icon: `${process.env.BACKEND_URL}/assets/node-images/tool-github.svg`,
};
