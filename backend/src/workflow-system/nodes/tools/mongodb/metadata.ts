import { ToolMetadataType } from 'src/workflow-system/workflow-system.type';

export const mongodbToolMetadata: ToolMetadataType = {
	type: 'mongodb-tool',
	label: 'MongoDB',
	description: `Enable your agents to manage MongoDB data`,
	version: '1.0.0',
	category: 'Tool',
	icon: `${process.env.BACKEND_URL}/assets/node-images/tool-mongodb.svg`,
};
