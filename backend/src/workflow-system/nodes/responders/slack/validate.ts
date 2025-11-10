import { z } from 'zod';
import { validate } from 'src/shared/utils/zod.util';
import {
	responderDataFormats,
	ResponderNodePropsType,
	ResponderNodeValidateReturnType,
} from 'src/workflow-system/workflow-system.type';
import { parseJson } from 'src/shared/utils/json.util';
import { DefaultReturnType } from 'src/shared/types/return.type';
import { isError } from 'src/shared/utils/error.util';

const slackResponderValidationSchema = z.object({
	format: z.enum(responderDataFormats, { message: 'Invalid format' }),
	data: z.object(
		{
			defaultData: z.unknown({ message: 'Invalid content' }),
		},
		{ message: 'Invalid slack responder data' },
	),
	config: z.object(
		{
			nodeId: z.string({ message: 'Invalid trigger node ID' }).min(1, { message: 'Trigger node ID is required' }),
			type: z.literal('slack', { message: 'Invalid type' }),
			channel_id: z.string({ message: 'Invalid channel ID' }).min(1, { message: 'Channel ID is required' }),
			bot_token: z.string({ message: 'Invalid bot token' }).min(1, { message: 'Bot token is required' }),
			trigger_type: z.enum(['all_messages', 'tagged_messages'], { message: 'Invalid trigger type' }).optional(),
			ts: z.string({ message: 'Invalid timestamp' }).optional(),
		},
		{ message: 'Invalid slack responder config' },
	),
});

export type SlackResponderDataType = z.infer<typeof slackResponderValidationSchema>['data'] & {
	defaultData: unknown;
};
export type SlackResponderConfigType = z.infer<typeof slackResponderValidationSchema>['config'];

export const slackResponderValidate = async ({
	format,
	data,
	config,
}: ResponderNodePropsType<SlackResponderDataType, SlackResponderConfigType>): Promise<
	DefaultReturnType<ResponderNodeValidateReturnType<SlackResponderDataType, SlackResponderConfigType>>
> => {
	const parsedDefaultData = format === 'json' ? parseJson(data.defaultData) : data.defaultData;
	if (isError(parsedDefaultData)) {
		return {
			...parsedDefaultData,
			trace: [...parsedDefaultData.trace, 'slackResponderValidate - parseJson'],
		} as DefaultReturnType<ResponderNodeValidateReturnType<SlackResponderDataType, SlackResponderConfigType>>;
	}

	const validationResult = validate({ data: { format, data, config }, schema: slackResponderValidationSchema });
	if (isError(validationResult)) {
		return {
			...validationResult,
			trace: [...validationResult.trace, 'slackResponderValidate - validate'],
		};
	}

	return {
		format: validationResult.format,
		data: { ...validationResult.data, defaultData: parsedDefaultData },
		config: validationResult.config,
	};
};
