import { TriggerStopListenerPropsType } from 'src/workflow-system/workflow-system.type';
import { CronStopListenerDataType, cronStopListenerValidate } from './validate';
import { DefaultReturnType } from 'src/shared/types/return.type';
import { returnErrorString } from 'src/shared/utils/return.util';
import { isError } from 'src/shared/utils/error.util';

export const cronStopListener = async (
	data: TriggerStopListenerPropsType<CronStopListenerDataType>,
): Promise<DefaultReturnType<true>> => {
	try {
		const validate = await cronStopListenerValidate(data);
		if (isError(validate)) {
			return {
				...validate,
				trace: ['cronStopListener - validate'],
			};
		}

		const { listener, config } = validate;
		const cronListener: { intervalId: NodeJS.Timeout | null } = listener;

		if (!cronListener || !cronListener.intervalId) {
			return {
				userMessage: 'No valid listener or active cron job found to stop!',
				error: 'No valid listener or active cron job found to stop!',
				errorType: 'InternalServerErrorException',
				errorData: { data },
				trace: ['cronStopListener - if (!cronListener || !cronListener.intervalId)'],
			};
		}

		if (config?.schedule_type === 'regular_intervals') {
			clearInterval(cronListener.intervalId);
		} else {
			clearTimeout(cronListener.intervalId);
		}

		cronListener.intervalId = null;
		return true;
	} catch (error) {
		return {
			userMessage: 'Failed to stop cron listener!',
			error: 'Failed to stop cron listener!',
			errorType: 'InternalServerErrorException',
			errorData: {
				error: returnErrorString(error),
			},
			trace: ['cronStopListener - catch'],
		};
	}
};
