import { NodeConfigType, NodeAiGeneratePropsType } from 'src/workflow-system/workflow-system.type';

export const whatsappToolConfig: NodeConfigType[] = [
	{
		name: 'WHATSAPP_ACCESS_TOKEN',
		label: 'Access Token',
		description: {
			text: `Used to authenticate your WhatsApp Business API requests. Generate this token in the Meta Business Manager under your WhatsApp Business Account settings.`,
			url: 'https://developers.facebook.com/docs/whatsapp/business-management-api/get-started',
		},
		type: 'text',
		placeholder: 'Enter the access token (e.g., EAAKBjKmuIp4BPIff...)',
		validation: [
			{
				field: 'WHATSAPP_ACCESS_TOKEN',
				label: 'WhatsApp Access Token',
				type: 'string',
				required: true,
				isSensitiveData: true,
			},
		],
	},
	{
		name: 'WABA_ID',
		label: 'WABA ID',
		description: {
			text: `The WhatsApp Business Account ID. Find this in the Meta Business Manager under WhatsApp > Account Tools > WhatsApp Accounts.`,
			url: 'https://developers.facebook.com/docs/whatsapp/business-management-api/get-started',
		},
		type: 'text',
		placeholder: 'Enter the WABA ID (e.g., 1799416250604673)',
		validation: [
			{
				field: 'WABA_ID',
				label: 'WABA ID',
				type: 'string',
				required: true,
				isSensitiveData: false,
			},
		],
	},
	{
		name: 'PHONE_NUMBER_ID',
		label: 'Phone Number ID',
		description: {
			text: `Unique identifier for your WhatsApp Business phone number. Find this in the Meta Business Manager under WhatsApp > Phone Numbers.`,
			url: 'https://developers.facebook.com/docs/whatsapp/business-management-api/manage-phone-numbers',
		},
		type: 'text',
		placeholder: 'Enter the phone number ID (e.g., 7544547XXXXXX)',
		validation: [
			{
				field: 'PHONE_NUMBER_ID',
				label: 'WhatsApp Phone Number ID',
				type: 'string',
				required: true,
				isSensitiveData: false,
			},
		],
	},
	{
		name: 'VERIFY_TOKEN',
		label: 'Verify Token',
		description: {
			text: `Used to verify the webhook when setting up WhatsApp Webhooks.`,
			url: 'https://developers.facebook.com/docs/graph-api/webhooks/getting-started/',
		},
		type: 'text',
		placeholder: 'Enter your webhook verify token',
		validation: [
			{
				field: 'VERIFY_TOKEN',
				label: 'Verify Token',
				type: 'string',
				required: true,
				isSensitiveData: false,
			},
		],
	},
	{
		name: 'TEMPLATE_NAME',
		label: 'Template Name',
		description: {
			text: `The name of the pre-approved WhatsApp template to use.`,
			url: 'https://developers.facebook.com/docs/whatsapp/message-templates',
		},
		type: 'text',
		placeholder: 'Enter template name',
		validation: [
			{
				field: 'TEMPLATE_NAME',
				label: 'Template Name',
				type: 'string',
			},
		],
	},
];

export const whatsappToolAiGenerateProps: NodeAiGeneratePropsType = {
	phone_numbers: 'str',
	template_parameters: 'list[str]',
	template_name: 'str',
};

export const whatsappToolAiPrompt = `VERY IMPORTANT:
Schema-specific rules:
- Use only values mentioned by the user. Never invent or guess data.
- Do not include formatting characters like *, #, or [] in values.
- Keys ending with _ifAny are optional if the user doesn't provide them.
WhatsApp-specific rules:
- 'phone_numbers' must be a single comma-separated string of valid phone numbers for ONE whatsapp_send call (e.g., +9199713XXXXX,+9198995XXXXX). Do NOT split into multiple calls.
- 'template_parameters' must be a list of strings corresponding to the variables in the specified template (e.g., ["John", "ABC123"] for test_1 template: "Hi {{1}}, Your new account has been created successfully. Please verify {{2}} to complete your profile.").
- 'template_name' can be provided to override the config value if specified.
- Do NOT use 'input_data' or include it in the response unless explicitly requested. If included, it should be a simple string, not a JSON object.
- Ask for 'phone_numbers' if not provided.
- Take the 'user_id' from the additional_kwargs parameter provided by the system.
`;
