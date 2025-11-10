import axios from 'axios';

import { DiscordSendConfigType, DiscordSendDataType, discordSendValidate } from './validate';
import { GeneralNodePropsType, GeneralNodeReturnType } from 'src/workflow-system/workflow-system.type';
import { formatLLMResponseToText } from 'src/shared/utils/ai.util';
import { DefaultReturnType } from 'src/shared/types/return.type';
import { returnErrorString } from 'src/shared/utils/return.util';
import { isError } from 'src/shared/utils/error.util';

export const discordSendExecute = async ({
	format,
	data,
	config,
}: GeneralNodePropsType<DiscordSendDataType, DiscordSendConfigType>): Promise<
	DefaultReturnType<GeneralNodeReturnType>
> => {
	try {
		const validate = await discordSendValidate({
			format,
			data,
			config,
		});
		if (isError(validate)) {
			return {
				...validate,
				trace: [...validate.trace, 'discordSendExecute - discordSendValidate'],
			};
		}

		const { defaultData } = validate.data;
		const { channel_id, bot_token } = validate.config;

		const formattedDefaultData =
			typeof defaultData === 'string' ? formatLLMResponseToText(defaultData) : JSON.stringify(defaultData);
		if (isError(formattedDefaultData)) {
			return {
				...formattedDefaultData,
				trace: [...formattedDefaultData.trace, 'discordSendExecute - formatLLMResponseToText'],
			};
		}

		const authHeader = `Bot ${bot_token}`;

		await axios.post(
			`https://discord.com/api/v10/channels/${channel_id}/messages`,
			{ content: formattedDefaultData },
			{ headers: { Authorization: authHeader, 'Content-Type': 'application/json' } },
		);

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
			trace: ['discordSendExecute - catch'],
		};
	}
};
