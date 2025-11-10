import { MetadataType } from 'src/workflow-system/workflow-system.type';

export const googleDocsReadMetadata: MetadataType = {
	type: 'google-docs-read',
	label: 'Google Docs Read',
	description: 'Read from any Google Doc',
	version: '1.0.0',
	category: 'Action',
	icon: `${process.env.BACKEND_URL}/assets/node-images/google-docs-read.svg`,
};
