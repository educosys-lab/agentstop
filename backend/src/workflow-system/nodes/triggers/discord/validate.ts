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

const discordValidationSchema = z.object({
	userId: z.string({ message: 'Invalid user ID' }).min(1, { message: 'User ID is required' }),
	workflowId: z.string({ message: 'Invalid workflow ID' }).min(1, { message: 'Workflow ID is required' }),
	triggerNodeId: z.string({ message: 'Invalid trigger node ID' }).min(1, { message: 'Trigger node ID is required' }),
	config: z.object(
		{
			bot_token: z.string({ message: 'Invalid bot token' }).min(1, { message: 'Bot token is required' }),
			trigger_type: z.enum(['all_messages', 'tagged_messages'], { message: 'Invalid trigger type' }),
			message_id: z.string({ message: 'Invalid message ID' }).optional(),
		},
		{ message: 'Invalid discord config' },
	),
});

export type DiscordStartListenerConfigType = z.infer<typeof discordValidationSchema>['config'];

export const discordStartListenerValidate = async (
	data: TriggerStartListenerDataPropsType<DiscordStartListenerConfigType>,
): Promise<DefaultReturnType<TriggerStartListenerValidateReturnType<DiscordStartListenerConfigType>>> => {
	const validationResult = validate({ data, schema: discordValidationSchema });
	if (isError(validationResult)) {
		return {
			...validationResult,
			trace: ['discordStartListenerValidate - validate'],
		};
	}

	return validationResult;
};

// Discord Stop Listener Validation
const discordStopListenerValidationSchema = z.object({
	listener: z.any().optional(),
});

export type DiscordStopListenerDataType = z.infer<typeof discordStopListenerValidationSchema>;

export const discordStopListenerValidate = async (
	data: TriggerStopListenerPropsType<DiscordStopListenerDataType>,
): Promise<DefaultReturnType<TriggerStopListenerValidateReturnType<DiscordStopListenerDataType>>> => {
	const validationResult = validate({ data, schema: discordStopListenerValidationSchema });
	if (isError(validationResult)) {
		return {
			...validationResult,
			trace: ['discordStopListenerValidate - validate'],
		};
	}

	return validationResult;
};
