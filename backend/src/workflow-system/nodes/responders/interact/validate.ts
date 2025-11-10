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

const interactResponderValidationSchema = z.object({
	format: z.enum(responderDataFormats, { message: 'Invalid format' }),
	data: z.object(
		{
			defaultData: z.unknown({ message: 'Invalid content' }),
			addMessage: z
				.function()
				.args(
					z.object({
						id: z.string({ message: 'Invalid message ID' }).min(1, { message: 'Message ID is required' }),
						workflowId: z
							.string({ message: 'Invalid workflow ID' })
							.min(1, { message: 'Workflow ID is required' }),
						format: z.enum(responderDataFormats, { message: 'Invalid format' }),
						content: z.unknown({ message: 'Invalid content' }),

						isInternal: z.boolean({ message: 'Invalid is internal' }),
						userId: z.string({ message: 'Invalid user ID' }).min(1, { message: 'User ID is required' }),
						showTempData: z.boolean({ message: 'Invalid show temp data flag' }).optional(),
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
		{ message: 'Invalid interact responder data' },
	),
	config: z.object(
		{
			nodeId: z.string({ message: 'Invalid trigger node ID' }).min(1, { message: 'Trigger node ID is required' }),
			type: z.literal('interact', { message: 'Invalid type' }),
			userId: z.string({ message: 'Invalid user ID' }).min(1, { message: 'User ID is required' }),
			workflowId: z.string({ message: 'Invalid workflow ID' }).min(1, { message: 'Workflow ID is required' }),
		},
		{ message: 'Invalid interact responder config' },
	),
});

export type InteractResponderDataType = z.infer<typeof interactResponderValidationSchema>['data'] & {
	defaultData: unknown;
};
export type InteractResponderConfigType = z.infer<typeof interactResponderValidationSchema>['config'];

export const interactResponderValidate = async ({
	format,
	data,
	config,
}: ResponderNodePropsType<InteractResponderDataType, InteractResponderConfigType>): Promise<
	DefaultReturnType<ResponderNodeValidateReturnType<InteractResponderDataType, InteractResponderConfigType>>
> => {
	const parsedDefaultData = format === 'json' ? parseJson(data.defaultData) : data.defaultData;
	if (isError(parsedDefaultData)) {
		return {
			...parsedDefaultData,
			trace: [...parsedDefaultData.trace, 'interactResponderValidate - parseJson'],
		} as DefaultReturnType<ResponderNodeValidateReturnType<InteractResponderDataType, InteractResponderConfigType>>;
	}

	const validationResult = validate({ data: { format, data, config }, schema: interactResponderValidationSchema });
	if (isError(validationResult)) {
		return {
			...validationResult,
			trace: [...validationResult.trace, 'interactResponderValidate - validate'],
		};
	}

	return {
		format: validationResult.format,
		data: { ...validationResult.data, defaultData: parsedDefaultData },
		config: validationResult.config,
	};
};
