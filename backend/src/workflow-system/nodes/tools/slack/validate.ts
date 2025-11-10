import { z } from 'zod';

import { validate } from 'src/shared/utils/zod.util';
import { ToolNodeValidatePropsType } from 'src/workflow-system/workflow-system.type';
import { DefaultReturnType } from 'src/shared/types/return.type';
import { isError } from 'src/shared/utils/error.util';

const validationSchema = z.object({
	config: z.object(
		{
			SLACK_BOT_TOKEN: z
				.string({ message: 'Invalid bot token' })
				.min(1, { message: 'Slack bot token is required' }),
			SLACK_TEAM_ID: z.string({ message: 'Invalid team ID' }).min(1, { message: 'Slack team ID is required' }),
			SLACK_CHANNEL_IDS: z
				.string({ message: 'Invalid channel IDs' })
				.min(1, { message: 'Slack channel IDs are required' })
				.regex(/^[A-Z0-9,]+$/, {
					message:
						'Slack channel IDs must be a comma-separated list of valid channel IDs (e.g., C01234567,C76543210)',
				}),
		},
		{ message: 'Invalid slack tool config' },
	),
});

export const slackToolValidate = async ({ config }: ToolNodeValidatePropsType): Promise<DefaultReturnType<true>> => {
	const validationResult = validate({ data: { config }, schema: validationSchema });
	if (isError(validationResult)) {
		return { ...validationResult, trace: ['slackToolValidate - validate'] };
	}

	return true;
};
