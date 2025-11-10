import { App } from '@slack/bolt';

import { TriggerStopListenerPropsType } from 'src/workflow-system/workflow-system.type';
import { SlackStopListenerDataType, slackStopListenerValidate } from './validate';
import { DefaultReturnType } from 'src/shared/types/return.type';
import { returnErrorString } from 'src/shared/utils/return.util';
import { isError } from 'src/shared/utils/error.util';

export const slackStopListener = async (
	data: TriggerStopListenerPropsType<SlackStopListenerDataType>,
): Promise<DefaultReturnType<true>> => {
	try {
		const validate = await slackStopListenerValidate(data);
		if (isError(validate)) {
			return {
				...validate,
				trace: ['slackStopListener - validate'],
			};
		}

		const { listener } = validate;

		const appToDestroy: App | undefined = listener as App;

		if (!appToDestroy || typeof appToDestroy.stop !== 'function') {
			return {
				userMessage: 'No valid listener or active app found to stop!',
				error: 'No valid listener or active app found to stop!',
				errorType: 'InternalServerErrorException',
				errorData: { data },
				trace: ['slackStopListener - if (!appToDestroy || typeof appToDestroy.stop !== "function")'],
			};
		}

		await appToDestroy.stop();

		return true;
	} catch (error) {
		return {
			userMessage: 'Failed to stop Slack listener!',
			error: 'Failed to stop Slack listener!',
			errorType: 'InternalServerErrorException',
			errorData: {
				error: returnErrorString(error),
			},
			trace: ['slackStopListener - catch'],
		};
	}
};
