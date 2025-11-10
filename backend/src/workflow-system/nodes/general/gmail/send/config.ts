import { NodeConfigType, NodeAiGeneratePropsType } from 'src/workflow-system/workflow-system.type';
import { authOptions } from './gmail-send.data';

export const gmailSendConfig: NodeConfigType[] = [
	{
		name: 'auth_type',
		label: 'Authentication Type',
		description: 'Select the authentication type for Gmail.',
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
		description: 'Select the Google Sheets document to write into.',
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
			{ field: 'refresh_token', label: 'Refresh token', type: 'string', required: true, isSensitiveData: true },
		],
	},
	{
		name: 'to_from_config',
		label: 'To',
		description: 'Enter the email addresses of the recipients.',
		type: 'text',
		placeholder: 'Enter recipient email addresses.',
		validation: [{ field: 'to_from_config', label: 'Recipient email', type: 'string' }],
	},
	{
		name: 'cc_from_config',
		label: 'CC',
		description: 'Enter email addresses to CC (optional).',
		type: 'text',
		placeholder: 'Enter CC email addresses.',
		validation: [{ field: 'cc_from_config', label: 'CC email', type: 'string' }],
	},
	{
		name: 'bcc_from_config',
		label: 'Bcc',
		description: 'Enter email addresses to BCC (optional).',
		type: 'text',
		placeholder: 'Enter BCC email addresses.',
		validation: [{ field: 'bcc_from_config', label: 'Bcc email', type: 'string' }],
	},
	{
		name: 'subject_from_config',
		label: 'Email Subject',
		description: 'Enter the subject of the email.',
		type: 'text',
		placeholder: 'Enter email subject',
		validation: [{ field: 'subject_from_config', label: 'Email subject', type: 'string' }],
	},
	{
		name: 'body_from_config',
		label: 'Email Body',
		description: 'Enter the body text of the email.',
		type: 'textarea',
		placeholder: 'Enter email body text',
		validation: [{ field: 'body_from_config', label: 'Email body', type: 'string' }],
	},
];

export const gmailSendAiGenerateProps: NodeAiGeneratePropsType = {
	to_email_addresses: 'str',
	cc_email_addresses_ifAny: 'str',
	bcc_email_addresses_ifAny: 'str',
	subject_of_email: 'str',
	body_of_email: 'str',
};

export const googleCalendarWriteAiPrompt = `VERY IMPORTANT:
Schema-specific rules:
- Use only values mentioned by the user. Never invent or guess data.
- Do not include formatting characters like *, #, or [] in values.`;

// export const googleCalendarWriteAiPrompt = `VERY IMPORTANT:
// Schema-specific rules:
// - Use only values mentioned by the user. Never invent or guess data. Ask for missing details.
// - Do not include formatting characters like *, #, or [] in values.
// - Keys ending with _ifAny are optional if the user doesn't provide them.

// Email-specific rules:
// - Ask for "to" if not provided.`;

// - Do not add placeholders like [Title], [Company], etc.
// - Always include natural structure: greeting (Hi, Hello), body, and closing (Thanks, Regards) — even if not explicitly mentioned — unless the user asks to omit them.
