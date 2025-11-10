import { WebClient } from '@slack/web-api';

import { SlackResponderConfigType, SlackResponderDataType, slackResponderValidate } from './validate';
import { splitText } from 'src/shared/utils/string.util';
import { ResponderNodePropsType, ResponderNodeReturnType } from 'src/workflow-system/workflow-system.type';
import { formatLLMResponseToText } from 'src/shared/utils/ai.util';
import { WORKFLOW_SYSTEM } from 'src/workflow-system/workflow-system.constant';
import { DefaultReturnType } from 'src/shared/types/return.type';
import { returnErrorString } from 'src/shared/utils/return.util';
import { isError } from 'src/shared/utils/error.util';

export const slackResponderExecute = async ({
	format,
	data,
	config,
}: ResponderNodePropsType<SlackResponderDataType, SlackResponderConfigType>): Promise<
	DefaultReturnType<ResponderNodeReturnType>
> => {
	try {
		const validate = await slackResponderValidate({ format, data, config });
		if (isError(validate)) {
			return {
				...validate,
				trace: [...validate.trace, 'slackResponderExecute - slackResponderValidate'],
			};
		}

		const { defaultData } = validate.data;
		const { bot_token, channel_id, ts } = validate.config;

		const formattedDefaultData =
			typeof defaultData === 'string' ? formatLLMResponseToText(defaultData) : JSON.stringify(defaultData);
		if (isError(formattedDefaultData)) {
			return {
				...formattedDefaultData,
				trace: [...formattedDefaultData.trace, 'slackResponderExecute - formatLLMResponseToText'],
			};
		}

		const client = new WebClient(bot_token);

		const chunks = splitText(formattedDefaultData, WORKFLOW_SYSTEM.SLACK_MESSAGE_LIMIT || 2000);
		for (const chunk of chunks) {
			await client.chat.postMessage({
				channel: channel_id,
				text: chunk,
				thread_ts: ts,
			});
		}

		return { status: 'success', format: 'string', content: { defaultData: 'Message sent successfully' } };
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
			trace: ['slackResponderExecute - catch'],
		};
	}
};
