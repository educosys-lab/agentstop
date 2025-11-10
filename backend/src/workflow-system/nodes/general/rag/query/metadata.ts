import { MetadataType } from 'src/workflow-system/workflow-system.type';

export const ragQueryMetadata: MetadataType = {
	type: 'rag',
	label: 'RAG',
	description: `RAG service`,
	version: '1.0.0',
	category: 'Action',
	icon: `${process.env.BACKEND_URL}/assets/node-images/rag.svg`,
};
