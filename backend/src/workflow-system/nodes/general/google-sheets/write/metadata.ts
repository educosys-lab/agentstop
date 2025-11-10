import { MetadataType } from 'src/workflow-system/workflow-system.type';

export const googleSheetsWriteMetadata: MetadataType = {
	type: 'google-sheets-write',
	label: 'Google Sheets Write',
	description: 'Write data to any Google Sheet',
	version: '1.0.0',
	category: 'Action',
	icon: `${process.env.BACKEND_URL}/assets/node-images/google-sheets-write.svg`,
};
