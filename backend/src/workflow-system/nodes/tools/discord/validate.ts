import { z } from 'zod';

import { validate } from 'src/shared/utils/zod.util';
import { ToolNodeValidatePropsType } from 'src/workflow-system/workflow-system.type';
import { DefaultReturnType } from 'src/shared/types/return.type';
import { isError } from 'src/shared/utils/error.util';

const validationSchema = z.object({
	config: z.object(
		{
			BOT_TOKEN: z.string({ message: 'Invalid bot token' }).min(1, { message: 'Discord bot token is required' }),
			CHANNEL_ID: z
				.string({ message: 'Invalid channel ID' })
				.min(1, { message: 'Channel ID is required' })
				.regex(/^[0-9]+$/, { message: 'Channel ID must be a valid numeric ID (e.g., 123456789012345678)' }),
		},
		{ message: 'Invalid discord tool config' },
	),
});

export const discordToolValidate = async ({ config }: ToolNodeValidatePropsType): Promise<DefaultReturnType<true>> => {
	const validationResult = validate({ data: { config }, schema: validationSchema });
	if (isError(validationResult)) {
		return { ...validationResult, trace: ['discordToolValidate - validate'] };
	}

	return true;
};
