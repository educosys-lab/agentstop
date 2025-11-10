import { NodeConfigType } from 'src/workflow-system/workflow-system.type';

export const whatsappTriggerConfig: NodeConfigType[] = [
	{
		name: 'whatsapp_access_token',
		label: 'Access Token',
		description: {
			text: `Used to connect your app to the WhatsApp Cloud API. You can create a temporary token (valid for 24 hours) from Meta Developer Dashboard or a permanent token using System Users in Business Manager.`,
			url: 'https://developers.facebook.com/blog/post/2022/12/05/auth-tokens/',
		},
		type: 'text',
		placeholder: 'Enter access token',
		validation: [
			{
				field: 'whatsapp_access_token',
				label: 'Access token',
				type: 'string',
				required: true,
				isSensitiveData: true,
			},
		],
	},
	{
		name: 'phone_number_id',
		label: 'Phone Number ID',
		description: {
			text: `Identifies the phone number linked to your WhatsApp Business account. Copy it from the 'From Phone Number' section in API Setup on your Meta Dashboard.`,
			url: 'https://developers.facebook.com/docs/whatsapp/cloud-api/get-started/',
		},
		type: 'text',
		placeholder: 'Enter phone number ID',
		validation: [
			{
				field: 'phone_number_id',
				label: 'Phone Number ID',
				type: 'string',
				required: true,
			},
		],
	},
	{
		name: 'verify_token',
		label: 'Verify Token',
		description: {
			text: `Used to verify your webhook when setting up the Callback URL in the Meta Dashboard. You can enter any value but it must match exactly in both places.`,
			url: 'https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks/payload-examples/',
		},
		type: 'text',
		placeholder: 'Enter verify token',
		validation: [
			{
				field: 'verify_token',
				label: 'Verify token',
				type: 'string',
				required: true,
				isSensitiveData: true,
			},
		],
	},
];
