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

const discordResponderValidationSchema = z.object({
	format: z.enum(responderDataFormats, { message: 'Invalid format' }),
	data: z.object(
		{ defaultData: z.unknown({ message: 'Invalid content' }) },
		{ message: 'Invalid discord responder data' },
	),
	config: z.object(
		{
			nodeId: z.string({ message: 'Invalid trigger node ID' }).min(1, { message: 'Trigger node ID is required' }),
			type: z.literal('discord', { message: 'Invalid type' }),
			channel_id: z.string({ message: 'Invalid channel ID' }).min(1, { message: 'Channel ID is required' }),
			bot_token: z.string({ message: 'Invalid bot token' }).min(1, { message: 'Bot token is required' }),
			trigger_type: z.enum(['all_messages', 'tagged_messages'], { message: 'Invalid trigger type' }).optional(),
			message_id: z.string({ message: 'Invalid message ID' }).optional(),
		},
		{ message: 'Invalid discord responder config' },
	),
});

export type DiscordResponderDataType = z.infer<typeof discordResponderValidationSchema>['data'] & {
	defaultData: unknown;
};
export type DiscordResponderConfigType = z.infer<typeof discordResponderValidationSchema>['config'];

export const discordResponderValidate = async ({
	format,
	data,
	config,
}: ResponderNodePropsType<DiscordResponderDataType, DiscordResponderConfigType>): Promise<
	DefaultReturnType<ResponderNodeValidateReturnType<DiscordResponderDataType, DiscordResponderConfigType>>
> => {
	const parsedDefaultData = format === 'json' ? parseJson(data.defaultData) : data.defaultData;
	if (isError(parsedDefaultData)) {
		return {
			...parsedDefaultData,
			trace: [...parsedDefaultData.trace, 'discordResponderValidate - parseJson'],
		} as DefaultReturnType<ResponderNodeValidateReturnType<DiscordResponderDataType, DiscordResponderConfigType>>;
	}

	const validationResult = validate({ data: { format, data, config }, schema: discordResponderValidationSchema });
	if (isError(validationResult)) {
		return {
			...validationResult,
			trace: [...validationResult.trace, 'discordResponderValidate - validate'],
		};
	}

	return {
		format: validationResult.format,
		data: { ...validationResult.data, defaultData: parsedDefaultData },
		config: validationResult.config,
	};
};
