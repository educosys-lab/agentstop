import { NodeConfigType, NodeAiGeneratePropsType } from 'src/workflow-system/workflow-system.type';
import { authOptions } from './google-sheets-write.data';

export const googleSheetsWriteConfig: NodeConfigType[] = [
	{
		name: 'auth_type',
		label: 'Authentication Type',
		description: 'Select the authentication type for Google Sheets.',
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
		description: 'Select the Google Sheets document to read from.',
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
	{
		name: 'google_sheets_range_from_config',
		label: 'Range',
		description: `The range in the Google Sheet to write data to.`,
		type: 'text',
		placeholder: 'Enter range',
		validation: [{ field: 'google_sheets_range_from_config', label: 'Range', type: 'string' }],
	},
];

export const googleSheetsWriteAiGenerateProps: NodeAiGeneratePropsType = {
	google_sheets_range_ifAny: 'str',
};

export const googleCalendarWriteAiPrompt = `VERY IMPORTANT:
Schema-specific rules:
- Use only values mentioned by the user. Never invent or guess data. Ask for missing details.
- Do not include formatting characters like *, #, or [] in values.
- Keys ending with _ifAny are optional if the user doesn't provide them.`;

// export const googleCalendarWriteAiPrompt = `VERY IMPORTANT:
// Schema-specific rules:
// - Use only values mentioned by the user. Never invent or guess data. Ask for missing details.
// - Do not include formatting characters like *, #, or [] in values.
// - Keys ending with _ifAny are optional if the user doesn't provide them.`;
