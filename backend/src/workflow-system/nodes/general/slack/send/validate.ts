import { z } from 'zod';

import {
	GeneralNodePropsType,
	GeneralNodeValidateReturnType,
	responderDataFormats,
} from 'src/workflow-system/workflow-system.type';
import { validate } from 'src/shared/utils/zod.util';
import { parseJson } from 'src/shared/utils/json.util';
import { DefaultReturnType } from 'src/shared/types/return.type';
import { isError } from 'src/shared/utils/error.util';

const slackSendValidationSchema = z.object({
	format: z.enum(responderDataFormats, { message: 'Invalid format' }),
	data: z.object({ defaultData: z.unknown({ message: 'Invalid content' }) }, { message: 'Invalid slack send data' }),
	config: z.object(
		{
			bot_token: z.string({ message: 'Invalid bot token' }).min(1, { message: 'Bot token is required' }),
			channel_id: z.string({ message: 'Invalid channel ID' }).min(1, { message: 'Channel ID is required' }),
		},
		{ message: 'Invalid slack send config' },
	),
});

export type SlackSendDataType = z.infer<typeof slackSendValidationSchema>['data'] & { defaultData: unknown };
export type SlackSendConfigType = z.infer<typeof slackSendValidationSchema>['config'];

export const slackSendValidate = async ({
	format,
	data,
	config,
}: GeneralNodePropsType<SlackSendDataType, SlackSendConfigType>): Promise<
	DefaultReturnType<GeneralNodeValidateReturnType<SlackSendDataType, SlackSendConfigType>>
> => {
	const parsedDefaultData =
		format === 'json' ? parseJson(data.defaultData) : { status: 'success', data: data.defaultData };
	if (isError(parsedDefaultData)) {
		return {
			...parsedDefaultData,
			trace: [...parsedDefaultData.trace, 'slackSendValidate - parseJson'],
		} as DefaultReturnType<GeneralNodeValidateReturnType<SlackSendDataType, SlackSendConfigType>>;
	}

	const validationResult = validate({ data: { format, data, config }, schema: slackSendValidationSchema });
	if (isError(validationResult)) {
		return {
			...validationResult,
			trace: [...validationResult.trace, 'slackSendValidate - slackSendValidationSchema'],
		} as DefaultReturnType<GeneralNodeValidateReturnType<SlackSendDataType, SlackSendConfigType>>;
	}

	return {
		format: validationResult.format,
		data: { ...validationResult.data, defaultData: parsedDefaultData },
		config: validationResult.config,
	};
};
