import { NodeConfigType } from 'src/workflow-system/workflow-system.type';

export const webScraperConfig: NodeConfigType[] = [
	{
		name: 'url',
		label: 'Website URL (Cheerio Web Scraper)',
		description: 'The URL of the website you want to scrape data from.',
		type: 'text',
		placeholder: 'Enter the website URL to scrape',
		validation: [{ field: 'url', type: 'string', required: true, label: 'URL' }],
	},
];
