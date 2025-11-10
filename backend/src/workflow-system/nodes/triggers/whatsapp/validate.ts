import { z } from 'zod';
import { validate } from 'src/shared/utils/zod.util';
import {
	TriggerStartListenerDataPropsType,
	TriggerStartListenerValidateReturnType,
	TriggerStopListenerPropsType,
	TriggerStopListenerValidateReturnType,
} from 'src/workflow-system/workflow-system.type';
import { DefaultReturnType } from 'src/shared/types/return.type';
import { isError } from 'src/shared/utils/error.util';

const whatsappValidationSchema = z.object({
	userId: z.string({ message: 'Invalid user ID' }).min(1, { message: 'User ID is required' }),
	workflowId: z.string({ message: 'Invalid workflow ID' }).min(1, { message: 'Workflow ID is required' }),
	triggerNodeId: z.string({ message: 'Invalid trigger node ID' }).min(1, { message: 'Trigger node ID is required' }),
	config: z.object(
		{
			whatsapp_access_token: z
				.string({ message: 'Invalid access token' })
				.min(1, { message: 'Access token is required' }),
			phone_number_id: z
				.string({ message: 'Invalid phone number ID' })
				.min(1, { message: 'Phone Number ID is required' }),
			verify_token: z.string({ message: 'Invalid verify token' }).min(1, { message: 'Verify token is required' }),
		},
		{ message: 'Invalid WhatsApp config' },
	),
});

export type WhatsAppStartListenerConfigType = z.infer<typeof whatsappValidationSchema>['config'];

export const whatsappStartListenerValidate = async (
	data: TriggerStartListenerDataPropsType<WhatsAppStartListenerConfigType>,
): Promise<DefaultReturnType<TriggerStartListenerValidateReturnType<WhatsAppStartListenerConfigType>>> => {
	const validationResult = validate({ data, schema: whatsappValidationSchema });
	if (isError(validationResult)) {
		return {
			...validationResult,
			trace: ['whatsappStartListenerValidate - validate'],
		};
	}

	return validationResult;
};

const whatsappStopListenerValidationSchema = z.object({
	listener: z
		.object({
			whatsapp_access_token: z.string().min(1, 'Access token is required'),
			phone_number_id: z.string().min(1, 'Phone Number ID is required'),
			verify_token: z.string().min(1, 'Verify token is required'),
		})
		.optional(),
});

export type WhatsAppStopListenerDataType = z.infer<typeof whatsappStopListenerValidationSchema>;

export const whatsappStopListenerValidate = async (
	data: TriggerStopListenerPropsType<WhatsAppStopListenerDataType>,
): Promise<DefaultReturnType<TriggerStopListenerValidateReturnType<WhatsAppStopListenerDataType>>> => {
	const validationResult = validate({ data, schema: whatsappStopListenerValidationSchema });
	if (isError(validationResult)) {
		return {
			...validationResult,
			trace: ['whatsappStopListenerValidate - validate'],
		};
	}

	return {
		...validationResult,
		trace: ['whatsappStopListenerValidate - validate'],
	};
};
