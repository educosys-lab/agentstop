import { NodeConfigType } from 'src/workflow-system/workflow-system.type';
import { authOptions, timezoneOptions } from './google-calender-read.data';

export const googleCalendarReadConfig: NodeConfigType[] = [
	{
		name: 'auth_type',
		label: 'Authentication Type',
		description: 'Select the authentication type for Google Calendar.',
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
		description: 'Select the Google account to use.',
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
		description: 'OAuth 2.0 access token for Google Calendar API.',
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
		description: 'OAuth 2.0 refresh token for Google Calendar API.',
		type: 'text',
		placeholder: 'Enter refresh token',
		showWhen: { field: 'auth_type', value: 'google_manual' },
		validation: [
			{ field: 'refresh_token', label: 'Refresh token', type: 'string', required: true, isSensitiveData: true },
		],
	},
	{
		name: 'calendar_id',
		label: 'Calendar ID',
		description: 'The ID of the Google Calendar to read events from. Use "primary" for the primary calendar.',
		type: 'text',
		defaultValue: 'primary',
		placeholder: 'Calendar ID (e.g., primary or email)',
		validation: [{ field: 'calendar_id', type: 'string', required: true, label: 'Calendar ID' }],
	},
	{
		name: 'time_min',
		label: 'Start Date',
		description: 'The start date and time for fetching events. Format: YYYY-MM-DDTHH:MM:SSZ',
		type: 'date-time',
		validation: [{ field: 'time_min', type: 'string', required: true, label: 'Start date and time' }],
	},
	{
		name: 'time_max',
		label: 'End Date',
		description: 'The end date and time for fetching events. Format: YYYY-MM-DDTHH:MM:SSZ',
		type: 'date-time',
		validation: [{ field: 'time_max', type: 'string', required: true, label: 'End date and time' }],
	},
	{
		name: 'timezone',
		label: 'Timezone',
		description: 'The timezone for the events.',
		type: 'select',
		placeholder: 'Select timezone',
		defaultValue: 'Asia/Kolkata',
		options: timezoneOptions,
		validation: [
			{
				field: 'timezone',
				label: 'Timezone',
				type: 'string',
				required: true,
				validValues: timezoneOptions.map((option) => option.value),
			},
		],
	},
];
