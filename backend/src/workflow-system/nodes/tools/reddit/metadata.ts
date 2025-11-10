import { ToolMetadataType } from 'src/workflow-system/workflow-system.type';

export const redditToolMetadata: ToolMetadataType = {
	type: 'reddit-tool',
	label: 'Reddit',
	description: `Scrape Reddit posts and trends using the Apify API to retrieve relevant post data or trending content.`,
	version: '1.0.0',
	category: 'Tool',
	icon: 'https://www.iconpacks.net/icons/2/free-reddit-logo-icon-2436-thumb.png',
};
