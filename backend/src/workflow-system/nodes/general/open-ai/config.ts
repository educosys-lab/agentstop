import { NodeConfigType } from 'src/workflow-system/workflow-system.type';
import { openAiModels } from './open-ai.data';

export const openAiConfig: NodeConfigType[] = [
	{
		name: 'apiKey',
		label: 'API Key',
		description: 'OpenAI API key.',
		type: 'text',
		placeholder: 'Enter your API key',
		validation: [{ field: 'apiKey', label: 'API key', type: 'string', required: true, isSensitiveData: true }],
	},
	{
		name: 'model',
		label: 'Select Model',
		description: 'Select the OpenAI model to use.',
		type: 'select',
		placeholder: 'Select a model',
		defaultValue: 'gpt-4o-mini',
		options: openAiModels,
		validation: [
			{
				field: 'model',
				label: 'Model',
				type: 'string',
				required: true,
				validValues: openAiModels.map((model) => model.value),
			},
		],
	},
	{
		name: 'systemPrompt',
		label: 'User Prompt',
		description: 'System prompt from the user to set the behavior of the assistant.',
		type: 'textarea',
		placeholder: 'Enter your user prompt',
		validation: [{ field: 'systemPrompt', label: 'User prompt', type: 'string' }],
	},
];
