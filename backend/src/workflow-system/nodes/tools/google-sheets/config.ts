import { NodeConfigType } from 'src/workflow-system/workflow-system.type';
import { authOptions } from './google-sheets.data';

export const googleSheetsToolConfig: NodeConfigType[] = [
	{
		name: 'auth_type',
		label: 'Authentication Type',
		description: 'Select the authentication type for Google Sheets.',
		type: 'select',
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
		description: 'Select the Google Sheets document to interact with.',
		type: 'select-google-sheets',
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
		description: 'OAuth 2.0 access token for Google Sheets API.',
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
		description: 'OAuth 2.0 refresh token for Google Sheets API.',
		type: 'text',
		placeholder: 'Enter refresh token',
		showWhen: { field: 'auth_type', value: 'google_manual' },
		validation: [
			{ field: 'refresh_token', label: 'Refresh token', type: 'string', required: true, isSensitiveData: true },
		],
	},
	{
		name: 'file_id',
		label: 'Sheet ID',
		description: 'The unique identifier for the Google Sheet.',
		type: 'text',
		placeholder: 'Enter Google Sheet ID',
		showWhen: { field: 'auth_type', value: 'google_manual' },
		validation: [{ field: 'file_id', label: 'Sheet ID', type: 'string', required: true }],
	},
];
