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

const whatsappResponderValidationSchema = z.object({
	format: z.enum(responderDataFormats, { message: 'Invalid format' }),
	data: z.object(
		{ defaultData: z.unknown({ message: 'Invalid content' }) },
		{ message: 'Invalid WhatsApp responder data' },
	),
	config: z.object(
		{
			nodeId: z.string({ message: 'Invalid node ID' }).min(1, { message: 'Node ID is required' }),
			type: z.literal('whatsapp', { message: 'Invalid type' }),
			access_token: z.string({ message: 'Invalid access token' }).min(1, { message: 'Access token is required' }),
			phone_number_id: z
				.string({ message: 'Invalid phone number ID' })
				.min(1, { message: 'Phone Number ID is required' }),
			recipient_phone_number: z
				.string({ message: 'Invalid recipient phone number' })
				.min(1, { message: 'Recipient phone number is required' }),
			webhook_url: z.string({ message: 'Invalid webhook URL' }).optional(),
		},
		{ message: 'Invalid WhatsApp responder config' },
	),
});

export type WhatsAppResponderDataType = z.infer<typeof whatsappResponderValidationSchema>['data'] & {
	defaultData: unknown;
};
export type WhatsAppResponderConfigType = z.infer<typeof whatsappResponderValidationSchema>['config'];

export const whatsappResponderValidate = async ({
	format,
	data,
	config,
}: ResponderNodePropsType<WhatsAppResponderDataType, WhatsAppResponderConfigType>): Promise<
	DefaultReturnType<ResponderNodeValidateReturnType<WhatsAppResponderDataType, WhatsAppResponderConfigType>>
> => {
	const parsedDefaultData = format === 'json' ? parseJson(data.defaultData) : data.defaultData;
	if (isError(parsedDefaultData)) {
		return {
			...parsedDefaultData,
			trace: [...parsedDefaultData.trace, 'whatsappResponderValidate - parseJson'],
		};
	}

	const validationResult = validate({
		data: { format, data, config },
		schema: whatsappResponderValidationSchema,
	});
	if (isError(validationResult)) {
		return {
			...validationResult,
			trace: [...validationResult.trace, 'whatsappResponderValidate - validate'],
		};
	}

	return {
		format: validationResult.format,
		data: { ...validationResult.data, defaultData: parsedDefaultData },
		config: validationResult.config,
	};
};
