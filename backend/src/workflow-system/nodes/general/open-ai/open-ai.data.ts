import { OpenAiOptionsEnum } from './open-ai.type';

export const openAiModels = [
	{ value: OpenAiOptionsEnum['gpt-4o'], label: 'GPT-4o' },
	{ value: OpenAiOptionsEnum['gpt-4o-mini'], label: 'GPT-4o-mini' },
	{ value: OpenAiOptionsEnum['gpt-4.1'], label: 'GPT-4.1' },
	{ value: OpenAiOptionsEnum['gpt-4.1-mini'], label: 'GPT-4.1-mini' },
	{ value: OpenAiOptionsEnum['gpt-4.1-nano'], label: 'GPT-4.1-nano' },
	{ value: OpenAiOptionsEnum['gpt-4.5-preview'], label: 'GPT-4.5-preview' },
	{ value: OpenAiOptionsEnum['o3'], label: 'O3' },
	{ value: OpenAiOptionsEnum['o3-mini'], label: 'O3-mini' },
	{ value: OpenAiOptionsEnum['o4-mini'], label: 'O4-mini' },
	{ value: OpenAiOptionsEnum['chatgpt-4o-latest'], label: 'ChatGPT 4o latest' },
	{ value: OpenAiOptionsEnum['gpt-3.5-turbo'], label: 'GPT-3.5 Turbo' },
	{ value: OpenAiOptionsEnum['gpt-4o-realtime-preview'], label: 'GPT-4o Realtime Preview' },
];
