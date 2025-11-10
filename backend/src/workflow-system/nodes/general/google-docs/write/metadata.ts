import { MetadataType } from 'src/workflow-system/workflow-system.type';

export const googleDocsWriteMetadata: MetadataType = {
	type: 'google-docs-write',
	label: 'Google Docs Write',
	description: 'Write to any Google Doc',
	version: '1.0.0',
	category: 'Action',
	icon: `${process.env.BACKEND_URL}/assets/node-images/google-docs-write.svg`,
};
