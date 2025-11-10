import { ToolMetadataType } from 'src/workflow-system/workflow-system.type';

export const redisToolMetadata: ToolMetadataType = {
	type: 'redis-tool',
	label: 'Redis',
	description: `Enable your agents to manage Redis data`,
	version: '1.0.0',
	category: 'Tool',
	icon: `${process.env.BACKEND_URL}/assets/node-images/tool-redis.svg`,
};
