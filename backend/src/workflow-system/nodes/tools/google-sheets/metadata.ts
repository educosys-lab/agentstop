import { ToolMetadataType } from 'src/workflow-system/workflow-system.type';

export const googleSheetsToolMetadata: ToolMetadataType = {
	type: 'google-sheets-tool',
	label: 'Google Sheets',
	description: `Enable your agents to manage Google Sheets data`,
	version: '1.0.0',
	category: 'Tool',
	icon: `${process.env.BACKEND_URL}/assets/node-images/tool-google-sheets.svg`,
};
