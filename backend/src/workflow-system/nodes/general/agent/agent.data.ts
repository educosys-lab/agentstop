import { AgentOptionsEnum } from './agent-config.type';

export const agentModels = [
	// Openai
	{
		category: 'OpenAI',
		options: [
			{ value: AgentOptionsEnum['gpt-4o'], label: 'GPT-4o' },
			{ value: AgentOptionsEnum['gpt-4o-mini'], label: 'GPT-4o-mini' },
			{ value: AgentOptionsEnum['gpt-4.1'], label: 'GPT-4.1' },
			{ value: AgentOptionsEnum['gpt-4.1-mini'], label: 'GPT-4.1-mini' },
			{ value: AgentOptionsEnum['gpt-4.1-nano'], label: 'GPT-4.1-nano' },
			{ value: AgentOptionsEnum['gpt-4.5-preview'], label: 'GPT-4.5-preview' },
			{ value: AgentOptionsEnum['o3-mini'], label: 'O3-mini' },
			{ value: AgentOptionsEnum['o4-mini'], label: 'O4-mini' },
			{ value: AgentOptionsEnum['chatgpt-4o-latest'], label: 'ChatGPT 4o latest' },
			{ value: AgentOptionsEnum['gpt-3.5-turbo'], label: 'GPT-3.5 Turbo' },
		],
	},
	// Gemini
	{
		category: 'Gemini',
		options: [
			{ value: AgentOptionsEnum['gemini-2.0-flash'], label: 'Gemini 2.0 Flash' },
			{ value: AgentOptionsEnum['gemini-1.5-pro'], label: 'Gemini 1.5 Pro' },
			{ value: AgentOptionsEnum['gemini-2.5-pro-preview-05-06'], label: 'Gemini 2.5 Pro Preview 05-06' },
			{ value: AgentOptionsEnum['gemini-2.0-flash-lite'], label: 'Gemini 2.0 Flash Lite' },
			{ value: AgentOptionsEnum['gemini-1.5-flash'], label: 'Gemini 1.5 Flash' },
		],
	},
	// Anthropic
	{
		category: 'Anthropic',
		options: [
			{ value: AgentOptionsEnum['claude-opus-4-0'], label: 'Claude Opus 4.0' },
			{ value: AgentOptionsEnum['claude-sonnet-4-0'], label: 'Claude Sonnet 4.0' },
			{ value: AgentOptionsEnum['claude-3-7-sonnet-latest'], label: 'Claude 3.7 Sonnet Latest' },
			{ value: AgentOptionsEnum['claude-3-5-sonnet-latest'], label: 'Claude 3.5 Sonnet Latest' },
			{ value: AgentOptionsEnum['claude-3-5-haiku-latest'], label: 'Claude 3.5 Haiku Latest' },
		],
	},
	// Groq
	{
		category: 'Groq',
		options: [
			{ value: AgentOptionsEnum['gemma2-9b-it'], label: 'Gemma2 9B IT' },
			{ value: AgentOptionsEnum['llama-3.3-70b-versatile'], label: 'Llama 3.3 70B Versatile' },
			{ value: AgentOptionsEnum['llama-3.1-8b-instant'], label: 'Llama 3.1 8B Instant' },
			{ value: AgentOptionsEnum['llama3-70b-8192'], label: 'Llama 3 70B 8192' },
			{ value: AgentOptionsEnum['llama3-8b-8192'], label: 'Llama 3 8B 8192' },
		],
	},
];
