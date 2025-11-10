import { ToolMetadataType } from 'src/workflow-system/workflow-system.type';

export const pineconeToolMetadata: ToolMetadataType = {
	type: 'pinecone-tool',
	label: 'Pinecone',
	description: `Enable your agents to manage Pinecone data`,
	version: '1.0.0',
	category: 'Tool',
	icon: `${process.env.BACKEND_URL}/assets/node-images/tool-pinecone.svg`,
};
