import { NodeConfigType } from 'src/workflow-system/workflow-system.type';

export const gitHubToolConfig: NodeConfigType[] = [
	{
		name: 'GITHUB_PERSONAL_ACCESS_TOKEN',
		label: 'Personal Access Token',
		description: {
			text: `Used to connect your agents with GitHub. A fine-grained personal access token is required. Visit GitHub settings, create a new token with the necessary repository permissions, and copy it.`,
			url: 'https://github.com/settings/personal-access-tokens',
		},
		type: 'text',
		placeholder: 'Enter the token',
		validation: [
			{
				field: 'GITHUB_PERSONAL_ACCESS_TOKEN',
				label: 'Personal access token',
				type: 'string',
				required: true,
				isSensitiveData: true,
			},
		],
	},
];
