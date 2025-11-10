import { ResponderMetadataType } from 'src/workflow-system/workflow-system.type';

export const googleSheetsResponderMetadata: ResponderMetadataType = {
	type: 'google-sheets-responder',
	label: 'Google Sheets',
	description: `This node writes data to a specified Google Sheet. It supports writing text data to a defined range.`,
	version: '1.0.0',
	category: 'Responder',
	icon: `${process.env.BACKEND_URL}/assets/node-images/responder-google-sheets.svg`,
	hidden: true,
};
