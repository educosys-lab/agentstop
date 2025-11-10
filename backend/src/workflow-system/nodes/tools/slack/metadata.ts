import { ToolMetadataType } from 'src/workflow-system/workflow-system.type';

export const slackToolMetadata: ToolMetadataType = {
	type: 'slack-tool',
	label: 'Slack',
	description: `Enable your agents to interact with Slack channels`,
	version: '1.0.0',
	category: 'Tool',
	icon: `${process.env.BACKEND_URL}/assets/node-images/tool-slack.svg`,
};
