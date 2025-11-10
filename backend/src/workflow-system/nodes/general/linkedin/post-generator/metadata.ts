import { MetadataType } from 'src/workflow-system/workflow-system.type';

export const linkedInPostMetadata: MetadataType = {
	type: 'linkedin-post',
	label: 'LinkedIn Post',
	description: 'Generate and post content to LinkedIn using OAuth authentication',
	version: '1.0.0',
	category: 'Action' as const,
	icon: `${process.env.BACKEND_URL}/assets/node-images/linkedin-post-generator.svg`,
	hidden: true,
};
