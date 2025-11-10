import { ToolMetadataType } from 'src/workflow-system/workflow-system.type';

export const quickchartToolMetadata: ToolMetadataType = {
	type: 'quickchart-tool',
	label: 'QuickChart',
	description: `Generate charts and images using QuickChart.io`,
	version: '1.0.0',
	category: 'Tool',
	icon: `${process.env.BACKEND_URL}/assets/node-images/tool-quickchart.svg`,
};
