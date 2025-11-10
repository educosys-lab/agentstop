import { MetadataType } from 'src/workflow-system/workflow-system.type';

export const ragIngestionMetadata: MetadataType = {
	type: 'rag',
	label: 'Rag Ingestion',
	description: `Ingest data into the RAG database`,
	version: '1.0.0',
	category: 'Action',
	icon: `${process.env.BACKEND_URL}/assets/node-images/rag.svg`,
};
