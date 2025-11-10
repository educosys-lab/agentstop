import { MetadataType } from 'src/workflow-system/workflow-system.type';

export const gmailReadMetadata: MetadataType = {
	type: 'gmail-read',
	label: 'Gmail Read',
	description: 'Read emails from your Gmail account',
	version: '1.0.0',
	category: 'Action',
	icon: `${process.env.BACKEND_URL}/assets/node-images/gmail-read.svg`,
};
