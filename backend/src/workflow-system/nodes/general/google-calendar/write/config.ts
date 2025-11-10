import { NodeConfigType, NodeAiGeneratePropsType } from 'src/workflow-system/workflow-system.type';
import { authOptions } from './google-calender-write.data';
import { timezoneOptions } from '../read/google-calender-read.data';

export const googleCalendarWriteConfig: NodeConfigType[] = [
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
			{ field: 'access_token', type: 'string', required: true, label: 'Access token', isSensitiveData: true },
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
			{ field: 'access_token', type: 'string', required: true, label: 'Access token', isSensitiveData: true },
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
		description: 'The ID of the Google Calendar to write events to. Use "primary" for the primary calendar.',
		type: 'text',
		defaultValue: 'primary',
		placeholder: 'Calendar ID (e.g., primary or email)',
		validation: [{ field: 'calendar_id', type: 'string', required: true, label: 'Calendar ID' }],
	},
	{
		name: 'time_min_from_config',
		label: 'Start Date and Time',
		description: 'The start date and time for the event.',
		type: 'date-time',
		validation: [{ field: 'time_min_from_config', type: 'string', label: 'Start date-time' }],
	},
	{
		name: 'time_max_from_config',
		label: 'End Date and Time',
		description: 'The end date and time for the event.',
		type: 'date-time',
		validation: [{ field: 'time_max_from_config', type: 'string', label: 'End date-time' }],
	},
	{
		name: 'timezone_from_config',
		label: 'Timezone',
		description: 'The timezone for the event.',
		type: 'select',
		defaultValue: 'Asia/Kolkata',
		options: timezoneOptions,
		validation: [
			{
				field: 'timezone_from_config',
				label: 'Timezone',
				type: 'string',
				validValues: timezoneOptions.map((option) => option.value),
			},
		],
	},
	{
		name: 'summary_from_config',
		label: 'Event Summary',
		description: 'The title or summary of the event.',
		type: 'text',
		placeholder: 'Enter event summary',
		validation: [{ field: 'summary_from_config', type: 'string', label: 'Event summary' }],
	},
	{
		name: 'description_from_config',
		label: 'Event Description',
		description: 'A detailed description of the event.',
		type: 'text',
		placeholder: 'Enter event description',
		validation: [{ field: 'description_from_config', type: 'string', label: 'Event description' }],
	},
	{
		name: 'guest_email_from_config',
		label: 'Guest Email (if any)',
		description: 'Email address of a guest to invite to the event.',
		type: 'text',
		placeholder: 'Enter guest email address',
		validation: [{ field: 'guest_email_from_config', type: 'string', label: 'Guest email' }],
	},
];

export const googleCalendarWriteAiGenerateProps: NodeAiGeneratePropsType = {
	iso_time_min: 'str',
	iso_time_max: 'str',
	iana_timezone_id: 'str',
	summary_of_event: 'str',
	description_of_event: 'str',
	guest_email_ifAny: 'str',
};

export const googleCalendarWriteAiPrompt = `VERY IMPORTANT:
Schema-specific rules:
- Use only values mentioned by the user. Never invent or guess data.
- Do not include formatting characters like *, #, or [] in values.

Date/Time Extraction Rules:
- “Today” → current date & time (day, month, year from today)
- “Tomorrow” → next day’s date & time
- “Coming Friday” → date & time of the next Friday
- For iana_timezone, use valid IANA IDs like Asia/Kolkata, America/New_York`;

// export const googleCalendarWriteAiPrompt = `VERY IMPORTANT:
// Schema-specific rules:
// - Use only values mentioned by the user. Never invent or guess data. Ask for missing details.
// - Do not include formatting characters like *, #, or [] in values.
// - Keys ending with _ifAny are optional if the user doesn't provide them.

// Date/Time Extraction Rules:
// - “Today” → current date & time (day, month, year from today)
// - “Tomorrow” → next day’s date & time
// - “Coming Friday” → date & time of the next Friday
// - For iana_timezone, use valid IANA IDs like Asia/Kolkata, America/New_York

// For inputs like “Create a meeting” or “Schedule a meeting on Monday”, prompt for missing fields such as date, time, title, description, guests, etc.`;
