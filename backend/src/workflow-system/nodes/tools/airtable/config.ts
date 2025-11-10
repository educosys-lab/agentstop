import { NodeConfigType } from 'src/workflow-system/workflow-system.type';

export const airtableToolConfig: NodeConfigType[] = [
	{
		name: 'AIRTABLE_API_KEY',
		label: 'Airtable API Key',
		description: {
			text: `Used to connect your agents with your Airtable workspace. Go to your Airtable account settings to generate and copy the API key.`,
			url: 'https://airtable.com/create/tokens',
		},
		type: 'text',
		placeholder: 'Enter the Airtable API key',
		validation: [
			{
				field: 'AIRTABLE_API_KEY',
				label: 'API key',
				type: 'string',
				required: true,
				isSensitiveData: true,
			},
		],
	},
];
