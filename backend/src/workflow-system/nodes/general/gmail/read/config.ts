import { NodeConfigType } from 'src/workflow-system/workflow-system.type';
import { authOptions, criteriaOptions } from './gmail-read.data';

export const gmailReadConfig: NodeConfigType[] = [
	{
		name: 'auth_type',
		label: 'Authentication Type',
		description: `Choose Google Sign-In for easy login or Connect with Google Tokens if you already have access and refresh tokens.`,
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
		description: 'Google Sheets document to write into.',
		type: 'select-google-account',
		defaultValue: undefined,
		options: [],
		showWhen: { field: 'auth_type', value: 'google_signin' },
		validation: [
			{ field: 'access_token', label: 'Access token', type: 'string', required: true, provider: 'google' },
			{ field: 'refresh_token', label: 'Refresh token', type: 'string', required: true, provider: 'google' },
		],
	},
	{
		name: 'access_token',
		label: 'Access Token',
		description: 'OAuth 2.0 access token for Gmail API.',
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
		description: 'OAuth 2.0 refresh token for Gmail API.',
		type: 'text',
		placeholder: 'Enter refresh token',
		showWhen: { field: 'auth_type', value: 'google_manual' },
		validation: [
			{ field: 'refresh_token', label: 'Access token', type: 'string', required: true, isSensitiveData: true },
		],
	},
	{
		name: 'criteria',
		label: 'Criteria',
		description: 'Criteria for fetching emails.',
		type: 'select',
		placeholder: 'Select criteria',
		defaultValue: 'all',
		options: criteriaOptions,
		validation: [
			{
				field: 'criteria',
				label: 'Criteria',
				type: 'string',
				required: true,
				validValues: criteriaOptions.map((option) => option.value),
			},
		],
	},
	{
		name: 'keyword',
		label: 'Search Keyword(s)',
		description: 'Keyword(s) to search for in the email subject or body.',
		type: 'text',
		placeholder: 'Enter keyword(s) to search (e.g., invoice payment)',
		validation: [{ field: 'keyword', label: 'Search keyword(s)', type: 'string' }],
	},
	{
		name: 'mark_as_read',
		label: 'Mark email as read when fetched',
		description: 'Select whether to mark the email message(s) as read after fetching.',
		type: 'checkbox',
		defaultValue: 'no',
		options: [
			{ value: 'yes', label: 'Yes' },
			{ value: 'no', label: 'No' },
		],
		validation: [
			{ field: 'mark_as_read', label: 'Mark email', type: 'string', required: true, validValues: ['yes', 'no'] },
		],
	},
	{
		name: 'max_results',
		label: 'Max Results',
		description: 'Enter the maximum number of results to fetch.',
		type: 'text',
		placeholder: 'Enter the maximum number of results to fetch',
		defaultValue: '10',
		validation: [{ field: 'max_results', label: 'Max results', type: 'string', required: true }],
	},
];
