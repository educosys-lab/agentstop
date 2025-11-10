import { z } from 'zod';

import {
	GeneralNodePropsType,
	GeneralNodeValidateReturnType,
	responderDataFormats,
} from 'src/workflow-system/workflow-system.type';
import { validate } from 'src/shared/utils/zod.util';
import { DefaultReturnType } from 'src/shared/types/return.type';
import { isError } from 'src/shared/utils/error.util';

const discordReadValidationSchema = z.object({
	format: z.enum(responderDataFormats, { message: 'Invalid format' }),
	data: z.object(
		{ defaultData: z.unknown({ message: 'Invalid default data' }) },
		{ message: 'Invalid discord read data' },
	),
	config: z.object(
		{
			bot_token: z.string({ message: 'Invalid bot token' }).min(1, { message: 'Bot token is required' }),
			channel_id: z.string({ message: 'Invalid channel ID' }).min(1, { message: 'Channel ID is required' }),
		},
		{ message: 'Invalid discord read config' },
	),
});

export type DiscordReadDataType = z.infer<typeof discordReadValidationSchema>['data'] & { defaultData: unknown };
export type DiscordReadConfigType = z.infer<typeof discordReadValidationSchema>['config'];

export const discordReadValidate = async ({
	format,
	data,
	config,
}: GeneralNodePropsType<DiscordReadDataType, DiscordReadConfigType>): Promise<
	DefaultReturnType<GeneralNodeValidateReturnType<DiscordReadDataType, DiscordReadConfigType>>
> => {
	const validationResult = validate({ data: { format, data, config }, schema: discordReadValidationSchema });
	if (isError(validationResult)) {
		return {
			...validationResult,
			trace: [...validationResult.trace, 'discordReadValidate - validate'],
		};
	}

	return {
		format: validationResult.format,
		data: { ...validationResult.data, defaultData: validationResult.data.defaultData },
		config: validationResult.config,
	};
};
