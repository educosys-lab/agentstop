import { NodeConfigType } from 'src/workflow-system/workflow-system.type';
import { httpMethodOptions } from './http.data';

export const httpConfig: NodeConfigType[] = [
	{
		name: 'url',
		label: 'URL',
		description: 'The URL to send the request to.',
		type: 'text',
		placeholder: 'https://api.example.com',
		validation: [{ field: 'url', label: 'URL', type: 'string', required: true }],
	},
	{
		name: 'method',
		label: 'Method',
		description: 'The HTTP method to use for the request, it can be GET, POST, PATCH, PUT, or DELETE.',
		type: 'select',
		placeholder: 'Select HTTP method',
		defaultValue: 'GET',
		options: httpMethodOptions,
		validation: [
			{
				field: 'method',
				label: 'Method',
				type: 'string',
				required: true,
				validValues: httpMethodOptions.map((option) => option.value),
			},
		],
	},
	{
		name: 'headers',
		label: 'Headers (JSON)',
		description: 'Custom headers to include in the request.',
		type: 'text',
		validation: [{ field: 'headers', label: 'Headers (JSON)', type: 'string', isSensitiveData: true }],
	},
	{
		name: 'body',
		label: 'Body (JSON)',
		description: 'The body of the request.',
		type: 'textarea',
		validation: [{ field: 'body', label: 'Body (JSON)', type: 'string' }],
	},
];
