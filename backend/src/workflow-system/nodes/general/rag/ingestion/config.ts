import { NodeConfigType } from 'src/workflow-system/workflow-system.type';

export const ragIngestionConfig: NodeConfigType[] = [
	{
		name: 'sourceType',
		label: 'Source Type',
		description: 'Source type to ingest.',
		type: 'select',
		placeholder: 'Select source type',
		options: [
			{ value: 'url', label: 'URL' },
			{ value: 'text', label: 'Text' },
			{ value: 'pdf', label: 'PDF' },
			{ value: 'docx', label: 'Docx' },
			{ value: 'ppt', label: 'PPT' },
			{ value: 'json', label: 'JSON' },
		],
		validation: [
			{
				field: 'sourceType',
				label: 'Source type',
				type: 'string',
				required: true,
				validValues: ['url', 'text', 'pdf', 'docx', 'ppt', 'json'],
			},
		],
	},
	{
		name: 'text',
		label: 'Text',
		description: 'Text to ingest.',
		type: 'textarea',
		placeholder: 'Enter your text',
		showWhen: { field: 'sourceType', value: 'text' },
		validation: [{ field: 'text', label: 'Text', type: 'string' }],
	},
	{
		name: 'url',
		label: 'URL',
		description: 'URL to ingest.',
		type: 'text',
		placeholder: 'Enter your URL',
		showWhen: { field: 'sourceType', value: 'url' },
		validation: [{ field: 'url', label: 'URL', type: 'string' }],
	},
	{
		name: 'sourceName',
		label: 'Source Name',
		description: 'Name given to the ingested data.',
		type: 'text',
		placeholder: 'Enter your source name',
		validation: [{ field: 'sourceName', label: 'Source name', type: 'string' }],
	},
];
