import { NodeConfigType } from 'src/workflow-system/workflow-system.type';

export const supabaseToolConfig: NodeConfigType[] = [
	{
		name: 'SUPABASE_ACCESS_TOKEN',
		label: 'Supabase Access Token',
		description: {
			text: `Used to connect your agents with your Supabase project. Go to your Supabase project settings to generate and copy the access token.`,
			url: 'https://supabase.com/dashboard/account/tokens',
		},
		type: 'text',
		placeholder: 'Enter the Supabase access token',
		validation: [
			{
				field: 'SUPABASE_ACCESS_TOKEN',
				label: 'Access token',
				type: 'string',
				required: true,
				isSensitiveData: true,
			},
		],
	},
];
