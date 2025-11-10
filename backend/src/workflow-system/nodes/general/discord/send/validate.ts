import { z } from 'zod';

import {
	GeneralNodePropsType,
	GeneralNodeValidateReturnType,
	responderDataFormats,
} from 'src/workflow-system/workflow-system.type';
import { parseJson } from 'src/shared/utils/json.util';
import { validate } from 'src/shared/utils/zod.util';
import { DefaultReturnType } from 'src/shared/types/return.type';
import { isError } from 'src/shared/utils/error.util';

const discordSendValidationSchema = z.object({
	format: z.enum(responderDataFormats, { message: 'Invalid format' }),
	data: z.object(
		{ defaultData: z.unknown({ message: 'Invalid content' }) },
		{ message: 'Invalid discord send data' },
	),
	config: z.object(
		{
			bot_token: z.string({ message: 'Invalid bot token' }).min(1, { message: 'Bot token is required' }),
			channel_id: z.string({ message: 'Invalid channel ID' }).min(1, { message: 'Channel ID is required' }),
		},
		{ message: 'Invalid discord send config' },
	),
});

export type DiscordSendDataType = z.infer<typeof discordSendValidationSchema>['data'] & { defaultData: unknown };
export type DiscordSendConfigType = z.infer<typeof discordSendValidationSchema>['config'];

export const discordSendValidate = async ({
	format,
	data,
	config,
}: GeneralNodePropsType<DiscordSendDataType, DiscordSendConfigType>): Promise<
	DefaultReturnType<GeneralNodeValidateReturnType<DiscordSendDataType, DiscordSendConfigType>>
> => {
	const parsedDefaultData = format === 'json' ? parseJson(data.defaultData) : data.defaultData;
	if (isError(parsedDefaultData)) {
		return {
			...parsedDefaultData,
			trace: [...parsedDefaultData.trace, 'discordSendValidate - parseJson'],
		} as DefaultReturnType<GeneralNodeValidateReturnType<DiscordSendDataType, DiscordSendConfigType>>;
	}

	const validationResult = validate({ data: { format, data, config }, schema: discordSendValidationSchema });
	if (isError(validationResult)) {
		return {
			...validationResult,
			trace: [...validationResult.trace, 'discordSendValidate - validate'],
		};
	}

	return {
		format: validationResult.format,
		data: { ...validationResult.data, defaultData: parsedDefaultData },
		config: validationResult.config,
	};
};
