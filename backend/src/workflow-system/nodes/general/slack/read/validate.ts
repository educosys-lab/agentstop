import { z } from 'zod';

import {
	GeneralNodePropsType,
	GeneralNodeValidateReturnType,
	responderDataFormats,
} from 'src/workflow-system/workflow-system.type';
import { validate } from 'src/shared/utils/zod.util';
import { DefaultReturnType } from 'src/shared/types/return.type';
import { isError } from 'src/shared/utils/error.util';

const slackReadValidationSchema = z.object({
	format: z.enum(responderDataFormats, { message: 'Invalid format' }),
	data: z.object({ defaultData: z.unknown({ message: 'Invalid content' }) }, { message: 'Invalid slack read data' }),
	config: z.object(
		{
			bot_token: z.string({ message: 'Invalid bot token' }).min(1, { message: 'Bot token is required' }),
			channel_id: z.string({ message: 'Invalid channel ID' }).min(1, { message: 'Channel ID is required' }),
		},
		{ message: 'Invalid slack read config' },
	),
});

export type SlackReadDataType = z.infer<typeof slackReadValidationSchema>['data'] & { defaultData: unknown };
export type SlackReadConfigType = z.infer<typeof slackReadValidationSchema>['config'];

export const slackReadValidate = async ({
	format,
	data,
	config,
}: GeneralNodePropsType<SlackReadDataType, SlackReadConfigType>): Promise<
	DefaultReturnType<GeneralNodeValidateReturnType<SlackReadDataType, SlackReadConfigType>>
> => {
	const validationResult = validate({ data: { format, data, config }, schema: slackReadValidationSchema });
	if (isError(validationResult)) {
		return {
			...validationResult,
			trace: [...validationResult.trace, 'slackReadValidate - slackReadValidationSchema'],
		} as DefaultReturnType<GeneralNodeValidateReturnType<SlackReadDataType, SlackReadConfigType>>;
	}

	return {
		format: validationResult.format,
		data: { ...validationResult.data, defaultData: validationResult.data.defaultData },
		config: validationResult.config,
	};
};
