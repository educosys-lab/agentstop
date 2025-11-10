import { ToolMetadataType } from 'src/workflow-system/workflow-system.type';

export const airbnbToolMetadata: ToolMetadataType = {
	type: 'airbnb-tool',
	label: 'Airbnb',
	description: `Enable your agents to interact with Airbnb data`,
	version: '1.0.0',
	category: 'Tool',
	icon: `${process.env.BACKEND_URL}/assets/node-images/tool-airbnb.svg`,
};
