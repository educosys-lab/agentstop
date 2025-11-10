import { ToolMetadataType } from 'src/workflow-system/workflow-system.type';

export const firecrawlToolMetadata: ToolMetadataType = {
	type: 'firecrawl-tool',
	label: 'Firecrawl Web Scraper',
	description: `Enable your agents to crawl and collect website data`,
	version: '1.0.0',
	category: 'Tool',
	icon: `${process.env.BACKEND_URL}/assets/node-images/tool-firecrawl-web-scraper.svg`,
};
