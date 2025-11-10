import { MetadataType } from 'src/workflow-system/workflow-system.type';

export const agentMetadata: MetadataType = {
	type: 'agent',
	label: 'Agent',
	description: `Run LLM agent with tools and memory`,
	version: '1.0.0',
	category: 'Agent',
	icon: `${process.env.BACKEND_URL}/assets/node-images/agent.svg`,
};
