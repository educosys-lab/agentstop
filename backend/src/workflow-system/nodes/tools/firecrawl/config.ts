import { NodeConfigType } from 'src/workflow-system/workflow-system.type';

export const firecrawlToolConfig: NodeConfigType[] = [
	{
		name: 'FIRECRAWL_API_KEY',
		label: 'Firecrawl API Key',
		description: {
			text: `Used to let agents access Firecrawl for web scraping and crawling. Log in to your Firecrawl dashboard to get your API key.`,
			url: 'https://www.firecrawl.dev/app/api-keys',
		},
		type: 'text',
		placeholder: 'Enter the Firecrawl API key',
		validation: [
			{
				field: 'FIRECRAWL_API_KEY',
				label: 'Firecrawl API Key',
				type: 'string',
				required: true,
				isSensitiveData: true,
			},
		],
	},
];
