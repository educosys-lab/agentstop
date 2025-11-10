import { NodeConfigType } from 'src/workflow-system/workflow-system.type';

export const ragQueryConfig: NodeConfigType[] = [
	{
		name: 'sourceName',
		label: 'Source Name',
		description: 'Name of the source to query.',
		type: 'text',
		placeholder: 'Enter your source name',
		validation: [{ field: 'sourceName', label: 'Source name', type: 'array' }],
	},
];
