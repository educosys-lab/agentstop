import { NodeConfigType } from 'src/workflow-system/workflow-system.type';
import { authOptions } from './linkedin-post-generator.data';

export const linkedInPostConfig: NodeConfigType[] = [
	{
		name: 'auth_type',
		label: 'Authentication Type',
		description: 'Select the authentication type for LinkedIn.',
		type: 'select',
		placeholder: 'Select auth type',
		defaultValue: 'linkedin_oauth',
		options: authOptions,
		showButton: { field: 'auth_type', value: 'linkedin_oauth', type: 'linkedin' },
		validation: [
			{
				field: 'auth_type',
				type: 'string',
				required: true,
				validValues: authOptions.map((option) => option.value),
				label: 'Authentication type',
			},
			{ field: 'access_token', type: 'string', required: true, label: 'Access token' },
		],
	},
	{
		name: 'access_token',
		label: 'Access Token',
		description: 'Your LinkedIn OAuth 2.0 access token',
		type: 'text',
		placeholder: 'Enter your LinkedIn OAuth 2.0 access token',
		showWhen: { field: 'auth_type', value: 'linkedin_manual' },
		validation: [
			{ field: 'access_token', type: 'string', required: true, label: 'Access token', isSensitiveData: true },
		],
	},
];
