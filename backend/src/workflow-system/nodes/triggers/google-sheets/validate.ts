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

const googleSheetsValidationSchema = z.object({
	userId: z.string({ message: 'Invalid user ID' }).min(1, { message: 'User ID is required' }),
	workflowId: z.string({ message: 'Invalid workflow ID' }).min(1, { message: 'Workflow ID is required' }),
	triggerNodeId: z.string({ message: 'Invalid trigger node ID' }).min(1, { message: 'Trigger node ID is required' }),
	config: z.object(
		{
			auth_type: z.enum(['google_signin', 'google_manual'], { message: 'Invalid authentication type' }),
			access_token: z.string({ message: 'Invalid access token' }).min(1, { message: 'Access token is required' }),
			refresh_token: z
				.string({ message: 'Invalid refresh token' })
				.min(1, { message: 'Refresh token is required' }),
			file_id: z.string({ message: 'Invalid sheet ID' }).min(1, { message: 'Sheet ID is required' }),
		},
		{ message: 'Invalid google sheets config' },
	),
});

export type GoogleSheetsStartListenerConfigType = z.infer<typeof googleSheetsValidationSchema>['config'];

export const googleSheetsStartListenerValidate = async (
	data: TriggerStartListenerDataPropsType<GoogleSheetsStartListenerConfigType>,
): Promise<DefaultReturnType<TriggerStartListenerValidateReturnType<GoogleSheetsStartListenerConfigType>>> => {
	const validationResult = validate({ data, schema: googleSheetsValidationSchema });
	if (isError(validationResult)) {
		return {
			...validationResult,
			trace: ['googleSheetsStartListenerValidate - validate'],
		};
	}

	return validationResult;
};

// Google Sheets Stop Listener Validation
const googleSheetsStopListenerValidationSchema = z.object({
	listener: z
		.object({
			scriptId: z.string().min(1, 'Script ID is required'),
			file_id: z.string().min(1, 'Sheet ID is required'),
			access_token: z.string().min(1, 'Access token is required'),
		})
		.optional(),
});

export type GoogleSheetsStopListenerDataType = z.infer<typeof googleSheetsStopListenerValidationSchema>;

export const googleSheetsStopListenerValidate = async (
	data: TriggerStopListenerPropsType<GoogleSheetsStopListenerDataType>,
): Promise<DefaultReturnType<TriggerStopListenerValidateReturnType<GoogleSheetsStopListenerDataType>>> => {
	const validationResult = validate({ data, schema: googleSheetsStopListenerValidationSchema });
	if (isError(validationResult)) {
		return {
			...validationResult,
			trace: ['googleSheetsStopListenerValidate - validate'],
		};
	}

	return {
		...validationResult,
		trace: ['googleSheetsStopListenerValidate - validate'],
	};
};
