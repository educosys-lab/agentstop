import { MetadataType } from 'src/workflow-system/workflow-system.type';

export const webScraperMetadata: MetadataType = {
	type: 'web-scraper',
	label: 'Web Scraper',
	description: 'Scrape content from a website using the provided URL',
	version: '1.0.0',
	category: 'Action',
	icon: `${process.env.BACKEND_URL}/assets/node-images/web-scrapper.svg`,
	hidden: true,
};
