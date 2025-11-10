import { NodeConfigType } from 'src/workflow-system/workflow-system.type';

export const tavilyToolConfig: NodeConfigType[] = [
	{
		name: 'TAVILY_API_KEY',
		label: 'Tavily API Key',
		description: {
			text: `Used to let your agents perform web searches with Tavily. You can create your API key from the Tavily dashboard under the API Keys section.`,
			url: 'https://app.tavily.com',
		},
		type: 'text',
		placeholder: 'Enter the api key',
		validation: [
			{
				field: 'TAVILY_API_KEY',
				label: 'Tavily api key',
				type: 'string',
				required: true,
				isSensitiveData: true,
			},
		],
	},
];
