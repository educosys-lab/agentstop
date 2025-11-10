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

// Slack start listener validate
const slackValidationSchema = z.object({
	userId: z.string({ message: 'Invalid user ID' }).min(1, { message: 'User ID is required' }),
	workflowId: z.string({ message: 'Invalid workflow ID' }).min(1, { message: 'Workflow ID is required' }),
	triggerNodeId: z.string({ message: 'Invalid trigger node ID' }).min(1, { message: 'Trigger node ID is required' }),
	config: z.object(
		{
			bot_token: z.string({ message: 'Invalid bot token' }).min(1, { message: 'Bot token is required' }),
			app_token: z.string({ message: 'Invalid app token' }).min(1, { message: 'App token is required' }),
			trigger_type: z.enum(['all_messages', 'tagged_messages'], { message: 'Invalid trigger type' }),
			ts: z.string({ message: 'Invalid timestamp' }).optional(),
		},
		{ message: 'Invalid slack config' },
	),
});

export type SlackStartListenerConfigType = z.infer<typeof slackValidationSchema>['config'];

export const slackStartListenerValidate = async ({
	userId,
	workflowId,
	triggerNodeId,
	config,
}: TriggerStartListenerDataPropsType<SlackStartListenerConfigType>): Promise<
	DefaultReturnType<TriggerStartListenerValidateReturnType<SlackStartListenerConfigType>>
> => {
	const validationResult = validate({
		data: { userId, workflowId, triggerNodeId, config },
		schema: slackValidationSchema,
	});
	if (isError(validationResult)) {
		return {
			...validationResult,
			trace: ['slackStartListenerValidate - validate'],
		};
	}

	return validationResult;
};

// Slack stop listener validate
const slackStopListenerValidationSchema = z.object({
	listener: z.any().optional(),
});

export type SlackStopListenerDataType = z.infer<typeof slackStopListenerValidationSchema>;

export const slackStopListenerValidate = async (
	data: TriggerStopListenerPropsType<SlackStopListenerDataType>,
): Promise<DefaultReturnType<TriggerStopListenerValidateReturnType<SlackStopListenerDataType>>> => {
	const validationResult = validate({ data, schema: slackStopListenerValidationSchema });
	if (isError(validationResult)) {
		return {
			...validationResult,
			trace: ['slackStopListenerValidate - validate'],
		};
	}

	return validationResult;
};
