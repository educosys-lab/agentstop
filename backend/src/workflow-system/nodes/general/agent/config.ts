import { NodeConfigType } from 'src/workflow-system/workflow-system.type';
import { agentModels } from './agent.data';

export const agentConfig: NodeConfigType[] = [
	{
		name: 'apiKey',
		label: 'API Key',
		description: [
			{
				text: `An API key is like a password. It helps connect your account so you can use different AI models in your missions.`,
				url: 'https://platform.openai.com/api-keys',
				showWhen: {
					field: 'model',
					validValues:
						agentModels
							.find((group) => group.category.startsWith('OpenAI'))
							?.options.map((data) => data.value) || [],
				},
			},
			{
				text: `An API key is like a password. It helps connect your account so you can use different AI models in your missions.`,
				url: 'https://aistudio.google.com/app/apikey',
				showWhen: {
					field: 'model',
					validValues:
						agentModels
							.find((group) => group.category.startsWith('Gemini'))
							?.options.map((data) => data.value) || [],
				},
			},
			{
				text: `An API key is like a password. It helps connect your account so you can use different AI models in your missions.`,
				url: 'https://console.anthropic.com/account/keys',
				showWhen: {
					field: 'model',
					validValues:
						agentModels
							.find((group) => group.category.startsWith('Anthropic'))
							?.options.map((data) => data.value) || [],
				},
			},
			{
				text: `An API key is like a password. It helps connect your account so you can use different AI models in your missions.`,
				url: 'https://console.groq.com/keys',
				showWhen: {
					field: 'model',
					validValues:
						agentModels
							.find((group) => group.category.startsWith('Groq'))
							?.options.map((data) => data.value) || [],
				},
			},
		],
		type: 'text',
		placeholder: 'Enter your API key',
		validation: [{ field: 'apiKey', label: 'API key', type: 'string', required: true, isSensitiveData: true }],
	},
	{
		name: 'model',
		label: 'Select Model',
		description: 'Some models are free to use, others may need a paid API key. Choose what suits you.',
		type: 'select',
		placeholder: 'Select a model',
		defaultValue: 'openai:gpt-4o',
		options: agentModels,
		validation: [
			{
				field: 'model',
				label: 'Model',
				type: 'string',
				required: true,
				validValues: agentModels.reduce((acc, group) => {
					return acc.concat(group.options.map((option) => option.value));
				}, [] as string[]),
			},
		],
	},
	{
		name: 'systemPrompt',
		label: 'User Prompt',
		description: `Guide how the AI should behave. Examples: “Reply like a fitness coach”, “Keep answers short and clear”`,
		type: 'textarea',
		placeholder: 'Enter your user prompt',
		validation: [{ field: 'systemPrompt', label: 'User prompt', type: 'string' }],
	},
	{
		name: 'llmHasMemory',
		label: 'Agent Memory',
		description: `Does the Agent have memory? If yes, it will remember past interactions.`,
		type: 'checkbox',
		defaultValue: 'true',
		options: [{ value: 'true', label: 'Agent memory' }],
		validation: [{ field: 'systemPrompt', label: 'System prompt', type: 'string' }],
	},
];
