import { NodeConfigType } from 'src/workflow-system/workflow-system.type';
import { authOptions } from './google-docs-write.data';

export const googleDocsWriteConfig: NodeConfigType[] = [
	{
		name: 'auth_type',
		label: 'Authentication Type',
		description: 'Select the authentication type for Google Docs.',
		type: 'select',
		placeholder: 'Select auth type',
		defaultValue: 'google_signin',
		options: authOptions,
		showButton: { field: 'auth_type', value: 'google_signin', type: 'google' },
		validation: [
			{
				field: 'auth_type',
				label: 'Authentication type',
				type: 'string',
				required: true,
				validValues: authOptions.map((option) => option.value),
			},
		],
	},
	{
		name: 'placeholder',
		label: 'Placeholder',
		description: 'Select the Google Docs document to wite into.',
		type: 'select-google-docs',
		defaultValue: undefined,
		options: [],
		showWhen: { field: 'auth_type', value: 'google_signin' },
		validation: [
			{ field: 'access_token', label: 'Access token', type: 'string', required: true, provider: 'google' },
			{ field: 'refresh_token', label: 'Refresh token', type: 'string', required: true, provider: 'google' },
			{ field: 'file_id', label: 'File', type: 'string', required: true },
		],
	},
	{
		name: 'access_token',
		label: 'Access Token',
		description: 'OAuth 2.0 access token for Google Docs API.',
		type: 'text',
		placeholder: 'Enter access token',
		showWhen: { field: 'auth_type', value: 'google_manual' },
		validation: [
			{ field: 'access_token', label: 'Access token', type: 'string', required: true, isSensitiveData: true },
		],
	},
	{
		name: 'refresh_token',
		label: 'Refresh Token',
		description: 'OAuth 2.0 refresh token for Google Docs API.',
		type: 'text',
		placeholder: 'Enter refresh token',
		showWhen: { field: 'auth_type', value: 'google_manual' },
		validation: [
			{ field: 'refresh_token', label: 'Refresh token', type: 'string', required: true, isSensitiveData: true },
		],
	},
	{
		name: 'file_id',
		label: 'Document ID',
		description: 'The unique identifier for the Google Docs document.',
		type: 'text',
		placeholder: 'Enter Google Docs ID',
		showWhen: { field: 'auth_type', value: 'google_manual' },
		validation: [{ field: 'file_id', label: 'Document ID', type: 'string', required: true }],
	},
];
