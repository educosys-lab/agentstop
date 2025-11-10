import axios from 'axios';

import { SlackSendConfigType, SlackSendDataType, slackSendValidate } from './validate';
import { GeneralNodePropsType, GeneralNodeReturnType } from 'src/workflow-system/workflow-system.type';
import { formatLLMResponseToText } from 'src/shared/utils/ai.util';
import { DefaultReturnType } from 'src/shared/types/return.type';
import { returnErrorString } from 'src/shared/utils/return.util';
import { isError } from 'src/shared/utils/error.util';

export const slackSendExecute = async ({
	format,
	data,
	config,
}: GeneralNodePropsType<SlackSendDataType, SlackSendConfigType>): Promise<DefaultReturnType<GeneralNodeReturnType>> => {
	try {
		const validate = await slackSendValidate({
			format,
			data,
			config,
		});
		if (isError(validate)) {
			return {
				...validate,
				trace: [...validate.trace, 'slackSendExecute - slackSendValidate'],
			};
		}

		const { defaultData } = validate.data;
		const { channel_id, bot_token } = validate.config;

		let messageContent = defaultData;

		if (typeof defaultData === 'object' && defaultData !== null && 'data' in defaultData) {
			messageContent = defaultData.data;
		}

		const formattedMessage =
			typeof messageContent === 'string'
				? formatLLMResponseToText(messageContent)
				: JSON.stringify(messageContent);

		if (isError(formattedMessage)) {
			return {
				...formattedMessage,
				trace: [...formattedMessage.trace, 'slackSendExecute - formatLLMResponseToText'],
			};
		}

		const response = await axios.post(
			'https://slack.com/api/chat.postMessage',
			{ channel: channel_id, text: formattedMessage },
			{ headers: { Authorization: `Bearer ${bot_token}`, 'Content-Type': 'application/json' } },
		);

		if (!response.data.ok) {
			return {
				userMessage: 'Error sending message to Slack!',
				error: response.data.error || 'Error sending message to Slack!',
				errorType: 'InternalServerErrorException',
				errorData: {
					error: response.data.error || 'Error sending message to Slack!',
				},
				trace: ['slackSendExecute - axios.post'],
			};
		}

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
				error: returnErrorString(error),
			},
			trace: ['slackSendExecute - catch'],
		};
	}
};
