import { MetadataType } from 'src/workflow-system/workflow-system.type';

export const openAiMetadata: MetadataType = {
	type: 'openai',
	label: 'ChatGPT',
	description: `Generate responses with ChatGPT`,
	version: '1.0.0',
	category: 'LLM',
	icon: `${process.env.BACKEND_URL}/assets/node-images/openai.svg`,
};
