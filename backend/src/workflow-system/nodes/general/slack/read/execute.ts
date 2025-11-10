import axios from 'axios';

import { SlackReadConfigType, SlackReadDataType, slackReadValidate } from './validate';
import { GeneralNodePropsType, GeneralNodeReturnType } from 'src/workflow-system/workflow-system.type';
import { WORKFLOW_SYSTEM } from 'src/workflow-system/workflow-system.constant';
import { DefaultReturnType } from 'src/shared/types/return.type';
import { returnErrorString } from 'src/shared/utils/return.util';
import { isError } from 'src/shared/utils/error.util';

export const slackReadExecute = async ({
	format,
	data,
	config,
}: GeneralNodePropsType<SlackReadDataType, SlackReadConfigType>): Promise<DefaultReturnType<GeneralNodeReturnType>> => {
	try {
		const validate = await slackReadValidate({
			format,
			data,
			config,
		});
		if (isError(validate)) {
			return {
				...validate,
				trace: [...validate.trace, 'slackReadExecute - slackReadValidate'],
			};
		}

		const { channel_id, bot_token } = validate.config;

		const authHeader = `Bearer ${bot_token}`;

		const response = await axios.get('https://slack.com/api/conversations.history', {
			params: { channel: channel_id, limit: WORKFLOW_SYSTEM.SLACK_READ_LIMIT },
			headers: {
				Authorization: authHeader,
				'Content-Type': 'application/json',
			},
		});

		if (!response.data.ok) {
			return {
				userMessage: 'Error reading messages from Slack!',
				error: response.data.error || 'Error reading messages from Slack!',
				errorType: 'InternalServerErrorException',
				errorData: {
					error: response.data.error || 'Error reading messages from Slack!',
				},
				trace: ['slackReadExecute - axios.get'],
			};
		}

		const messages = response.data.messages.map((msg: any) => ({
			id: msg.ts,
			content: msg.text,
			author: msg.user || 'unknown',
			timestamp: msg.ts,
		}));

		return {
			status: 'success',
			format: 'object',
			content: { defaultData: messages },
		};
	} catch (error) {
		return {
			userMessage: 'Internal server error!',
			error: 'Internal server error!',
			errorType: 'InternalServerErrorException',
			errorData: {
				error: returnErrorString(error),
			},
			trace: ['slackReadExecute - catch'],
		};
	}
};
