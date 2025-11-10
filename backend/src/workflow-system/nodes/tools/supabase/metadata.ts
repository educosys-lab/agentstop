import { ToolMetadataType } from 'src/workflow-system/workflow-system.type';

export const supabaseToolMetadata: ToolMetadataType = {
	type: 'supabase-tool',
	label: 'Supabase',
	description: `Enable your agents to interact with Supabase data`,
	version: '1.0.0',
	category: 'Tool',
	icon: `${process.env.BACKEND_URL}/assets/node-images/tool-supabase.svg`,
};
