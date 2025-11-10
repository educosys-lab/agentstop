import { NodeConfigType } from 'src/workflow-system/workflow-system.type';

export const pineconeToolConfig: NodeConfigType[] = [
	{
		name: 'PINECONE_API_KEY',
		label: 'Pinecone API Key',
		description: {
			text: `Used to connect your agents to your Pinecone vector database. Create an API key from your Pinecone dashboard under API Keys section.`,
			url: 'https://app.pinecone.io/api-keys',
		},
		type: 'text',
		placeholder: 'Enter the Pinecone API key',
		validation: [
			{
				field: 'PINECONE_API_KEY',
				label: 'Pinecone API Key',
				type: 'string',
				required: true,
				isSensitiveData: true,
			},
		],
	},
];
