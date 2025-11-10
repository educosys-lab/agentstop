import { TriggerMetadataType } from 'src/workflow-system/workflow-system.type';

export const googleSheetsTriggerMetadata: TriggerMetadataType = {
	type: 'google-sheets-trigger',
	label: 'Google Sheets',
	description: `Start mission on changes to a Google Sheet, such as cell edits or row additions`,
	version: '1.0.0',
	category: 'Trigger',
	icon: `${process.env.BACKEND_URL}/assets/node-images/trigger-google-sheets.svg`,
	hidden: true,
};
