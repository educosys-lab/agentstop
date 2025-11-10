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

export const telegramResponderValidationSchema = z.object({
	format: z.enum(responderDataFormats, { message: 'Invalid format' }),
	data: z.object(
		{ defaultData: z.unknown({ message: 'Invalid content' }) },
		{ message: 'Invalid telegram responder data' },
	),
	config: z.object(
		{
			nodeId: z.string({ message: 'Invalid trigger node ID' }).min(1, { message: 'Trigger node ID is required' }),
			type: z.literal('telegram', { message: 'Invalid type' }),
			chatId: z.number({ message: 'Invalid chat ID' }).min(1, { message: 'Chat ID is required' }),
			accessToken: z
				.string({ message: 'Invalid access token' })
				.min(1, { message: 'Telegram access token is required' }),
		},
		{ message: 'Invalid telegram responder config' },
	),
});

export type TelegramResponderDataType = z.infer<typeof telegramResponderValidationSchema>['data'] & {
	defaultData: unknown;
};
export type TelegramResponderConfigType = z.infer<typeof telegramResponderValidationSchema>['config'];

export const telegramResponderValidate = async ({
	format,
	data,
	config,
}: ResponderNodePropsType<TelegramResponderDataType, TelegramResponderConfigType>): Promise<
	DefaultReturnType<ResponderNodeValidateReturnType<TelegramResponderDataType, TelegramResponderConfigType>>
> => {
	const parsedDefaultData = format === 'json' ? parseJson(data.defaultData) : data.defaultData;
	if (isError(parsedDefaultData)) {
		return {
			...parsedDefaultData,
			trace: [...parsedDefaultData.trace, 'telegramResponderValidate - parseJson'],
		} as DefaultReturnType<ResponderNodeValidateReturnType<TelegramResponderDataType, TelegramResponderConfigType>>;
	}

	const validationResult = validate({ data: { format, data, config }, schema: telegramResponderValidationSchema });
	if (isError(validationResult)) {
		return {
			...validationResult,
			trace: [...validationResult.trace, 'telegramResponderValidate - validate'],
		};
	}

	return {
		format: validationResult.format,
		data: { ...validationResult.data, defaultData: parsedDefaultData },
		config: validationResult.config,
	};
};
