import { ToolMetadataType } from 'src/workflow-system/workflow-system.type';

export const airtableToolMetadata: ToolMetadataType = {
	type: 'airtable-tool',
	label: 'Airtable',
	description: `Enable your agents to manage Airtable data`,
	version: '1.0.0',
	category: 'Tool',
	icon: `${process.env.BACKEND_URL}/assets/node-images/tool-airtable.svg`,
};
