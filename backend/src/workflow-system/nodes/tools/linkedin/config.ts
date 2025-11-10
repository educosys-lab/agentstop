import { NodeConfigType, NodeAiGeneratePropsType } from 'src/workflow-system/workflow-system.type';

export const linkedinToolConfig: NodeConfigType[] = [
	{
		name: 'APIFY_API_TOKEN',
		label: 'Apify API Token',
		description: {
			text: `Used to authenticate requests to the Apify API for LinkedIn profile scraping. Generate this token in your Apify account settings.`,
			url: 'https://docs.apify.com/platform/integrations/api',
		},
		type: 'text',
		placeholder: 'Enter the Apify API token (e.g., apify_api_...)',
		validation: [
			{
				field: 'APIFY_API_TOKEN',
				label: 'Apify API Token',
				type: 'string',
				required: true,
				isSensitiveData: true,
			},
		],
	},
];

export const linkedinToolAiGenerateProps: NodeAiGeneratePropsType = {
	profile_urls: 'list[str]',
};

export const linkedinToolAiPrompt = `VERY IMPORTANT:
Schema-specific rules:
- Use only values mentioned by the user. Never invent or guess data.
- Do not include formatting characters like *, #, or [] in values.
- Keys ending with _ifAny are optional if the user doesn't provide them.
LinkedIn-specific rules:
- 'profile_urls' must be a list of valid LinkedIn profile URLs (e.g., ["https://www.linkedin.com/in/username"]). Each URL must include the protocol (http:// or https://).
- Validate that URLs are properly formatted LinkedIn profile URLs.
- Ask for 'profile_urls' if not provided.
- Take the 'user_id' from the additional_kwargs parameter provided by the system.
`;
