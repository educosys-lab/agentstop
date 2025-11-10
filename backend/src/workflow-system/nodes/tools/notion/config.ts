import { NodeConfigType } from 'src/workflow-system/workflow-system.type';

export const notionToolConfig: NodeConfigType[] = [
	{
		name: 'OPENAPI_MCP_HEADERS',
		label: 'Notion API Headers',
		description: {
			text: `Used to connect your agents with your Notion workspace. Create an integration from the Notion Integrations page and copy the Internal Integration Token. The token will look like this - Bearer ntn_****. Example headers in JSON format: {"Authorization": "Bearer ntn_****", "Notion-Version": "2022-06-28"}`,
			url: 'https://www.notion.so/profile/integrations',
		},
		type: 'text',
		placeholder: 'Enter headers (e.g., {"Authorization": "Bearer ntn_****", "Notion-Version": "2022-06-28"})',
		validation: [
			{
				field: 'OPENAPI_MCP_HEADERS',
				label: 'Notion API Headers',
				type: 'string',
				required: true,
				isSensitiveData: true,
			},
		],
	},
];
