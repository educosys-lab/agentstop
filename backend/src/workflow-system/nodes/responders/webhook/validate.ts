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
import { ERROR_TYPES } from 'src/shared/types/error.type';

const webhookResponderValidationSchema = z.object({
	format: z.enum(responderDataFormats, { message: 'Invalid format' }),
	data: z.object(
		{
			defaultData: z.unknown({ message: 'Invalid content' }),
			sendResponse: z
				.function()
				.args(
					z.object({
						requestId: z
							.string({ message: 'Invalid request ID' })
							.min(1, { message: 'Request ID is required' }),
						data: z.unknown({ message: 'Invalid data' }),
						statusCode: z.number({ message: 'Invalid status code' }),
					}),
				)
				.returns(
					z.promise(
						z.union([
							z.boolean(),
							z.object({
								userMessage: z.string({ message: 'Invalid user message' }),
								error: z.string({ message: 'Invalid error' }),
								errorType: z.enum(ERROR_TYPES, { message: 'Invalid error type' }),
								errorData: z.record(z.any(), { message: 'Invalid error data' }),
								trace: z.array(z.string(), { message: 'Invalid trace' }),
							}),
						]),
					),
				),
		},
		{ message: 'Invalid webhook responder data' },
	),
	config: z.object(
		{
			nodeId: z.string({ message: 'Invalid trigger node ID' }).min(1, { message: 'Trigger node ID is required' }),
			type: z.literal('webhook', { message: 'Invalid type' }),
			userId: z.string({ message: 'Invalid user ID' }).min(1, { message: 'User ID is required' }),
			requestId: z.string({ message: 'Invalid request ID' }).min(1, { message: 'Request ID is required' }),
		},
		{ message: 'Invalid webhook responder config' },
	),
});

export type WebhookResponderDataType = z.infer<typeof webhookResponderValidationSchema>['data'] & {
	defaultData: unknown;
};
export type WebhookResponderConfigType = z.infer<typeof webhookResponderValidationSchema>['config'];

export const webhookResponderValidate = async ({
	format,
	data,
	config,
}: ResponderNodePropsType<WebhookResponderDataType, WebhookResponderConfigType>): Promise<
	DefaultReturnType<ResponderNodeValidateReturnType<WebhookResponderDataType, WebhookResponderConfigType>>
> => {
	const parsedDefaultData = format === 'json' ? parseJson(data.defaultData) : data.defaultData;
	if (isError(parsedDefaultData)) {
		return {
			...parsedDefaultData,
			trace: [...parsedDefaultData.trace, 'webhookResponderValidate - parseJson'],
		} as DefaultReturnType<ResponderNodeValidateReturnType<WebhookResponderDataType, WebhookResponderConfigType>>;
	}

	const validationResult = validate({ data: { format, data, config }, schema: webhookResponderValidationSchema });
	if (isError(validationResult)) {
		return {
			...validationResult,
			trace: [...validationResult.trace, 'webhookResponderValidate - validate'],
		};
	}

	return {
		format: validationResult.format,
		data: { ...validationResult.data, defaultData: parsedDefaultData },
		config: validationResult.config,
	};
};
