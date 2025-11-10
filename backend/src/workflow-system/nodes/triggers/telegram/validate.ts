import { z } from 'zod';

import { validate } from 'src/shared/utils/zod.util';
import {
	TriggerStartListenerDataPropsType,
	TriggerStartListenerValidateReturnType,
} from 'src/workflow-system/workflow-system.type';
import { DefaultReturnType } from 'src/shared/types/return.type';
import { isError } from 'src/shared/utils/error.util';

const telegramValidationSchema = z.object({
	userId: z.string({ message: 'Invalid user ID' }).min(1, { message: 'User ID is required' }),
	workflowId: z.string({ message: 'Invalid workflow ID' }).min(1, { message: 'Workflow ID is required' }),
	triggerNodeId: z.string({ message: 'Invalid trigger node ID' }).min(1, { message: 'Trigger node ID is required' }),
	config: z.object(
		{
			accessToken: z
				.string({ message: 'Invalid access token' })
				.min(1, { message: 'Telegram access token is required' }),
		},
		{ message: 'Invalid telegram config' },
	),
});

export type TelegramStartListenerConfigType = z.infer<typeof telegramValidationSchema>['config'];

export const telegramStartListenerValidate = async ({
	userId,
	workflowId,
	triggerNodeId,
	config,
}: TriggerStartListenerDataPropsType<TelegramStartListenerConfigType>): Promise<
	DefaultReturnType<TriggerStartListenerValidateReturnType<TelegramStartListenerConfigType>>
> => {
	const validationResult = validate({
		data: { userId, workflowId, triggerNodeId, config },
		schema: telegramValidationSchema,
	});
	if (isError(validationResult)) {
		return {
			...validationResult,
			trace: ['telegramStartListenerValidate - validate'],
		};
	}

	return validationResult;
};
