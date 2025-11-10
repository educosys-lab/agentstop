import { ToolMetadataType } from 'src/workflow-system/workflow-system.type';

export const linkedinToolMetadata: ToolMetadataType = {
	type: 'linkedin-tool',
	label: 'LinkedIn',
	description: `Scrape LinkedIn profiles to retrieve detailed lead information using the Apify API.`,
	version: '1.0.0',
	category: 'Tool',
	icon: `${process.env.BACKEND_URL}/assets/node-images/tool-linkedin.svg`,
};
