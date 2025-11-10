import { MetadataType } from 'src/workflow-system/workflow-system.type';

export const googleSheetsReadMetadata: MetadataType = {
	type: 'google-sheets-read',
	label: 'Google Sheets Read',
	description: 'Read from any Google Sheet',
	version: '1.0.0',
	category: 'Action',
	icon: `${process.env.BACKEND_URL}/assets/node-images/google-sheets-read.svg`,
};
