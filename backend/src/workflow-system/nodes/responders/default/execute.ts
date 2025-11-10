import { DefaultReturnType } from 'src/shared/types/return.type';
import {
	ResponderNodeConfigType,
	ResponderNodePropsType,
	ResponderNodeReturnType,
} from 'src/workflow-system/workflow-system.type';
import { telegramResponderExecute } from '../telegram/execute';
import { discordResponderExecute } from '../discord/execute';
import { slackResponderExecute } from '../slack/execute';
import { googleSheetsResponderExecute } from '../google-sheets/execute';
import { returnErrorString } from 'src/shared/utils/return.util';
import { whatsappResponderExecute } from '../whatsapp/execute';

export async function defaultResponderExecute({
	format,
	data,
	config,
}: ResponderNodePropsType<any, ResponderNodeConfigType>): Promise<DefaultReturnType<ResponderNodeReturnType>> {
	try {
		if (config.type === 'cron') {
			return {
				status: 'success',
				format: 'string',
				content: { defaultData: 'Message sent successfully' },
			};
		}

		const responders = {
			discord: discordResponderExecute,
			'google-sheets': googleSheetsResponderExecute,
			slack: slackResponderExecute,
			telegram: telegramResponderExecute,
			whatsapp: whatsappResponderExecute,
		};

		const currentResponder = responders[config.type];
		if (!currentResponder) {
			return {
				userMessage: 'Unsupported responder type!',
				error: 'Unsupported responder type!',
				errorType: 'BadRequestException',
				errorData: { format, data, config },
				trace: ['defaultResponderExecute - if (!currentResponder)'],
			};
		}

		await currentResponder({ format, data, config });

		return {
			status: 'success',
			format: 'string',
			content: { defaultData: 'Message sent successfully' },
		};
	} catch (error) {
		return {
			userMessage: 'Internal server error!',
			error: 'Internal server error!',
			errorType: 'InternalServerErrorException',
			errorData: {
				format,
				data,
				config,
				error: returnErrorString(error),
			},
			trace: ['defaultResponderExecute - catch'],
		};
	}
}
