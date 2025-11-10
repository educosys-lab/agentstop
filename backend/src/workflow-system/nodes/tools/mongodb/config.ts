import { NodeConfigType } from 'src/workflow-system/workflow-system.type';

export const mongodbToolConfig: NodeConfigType[] = [
	{
		name: 'MDB_MCP_CONNECTION_STRING',
		label: 'MongoDB Connection String',
		description: {
			text: `Used to connect your agents with your MongoDB database. Go to your MongoDB dashboard, choose your cluster, and copy the connection string from the "Connect" section.`,
			url: 'https://www.mongodb.com/docs/manual/reference/connection-string/'
		  },
		type: 'text',
		placeholder: 'Enter the connection string',
		validation: [
			{
				field: 'MDB_MCP_CONNECTION_STRING',
				label: 'MongoDB Connection String',
				type: 'string',
				required: true,
				isSensitiveData: true,
			},
		],
	},
];
