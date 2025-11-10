import axios from 'axios';
import { DiscordReadConfigType, DiscordReadDataType, discordReadValidate } from './validate';
import { GeneralNodePropsType, GeneralNodeReturnType } from 'src/workflow-system/workflow-system.type';
import { WORKFLOW_SYSTEM } from 'src/workflow-system/workflow-system.constant';
import { DefaultReturnType } from 'src/shared/types/return.type';
import { returnErrorString } from 'src/shared/utils/return.util';
import { isError } from 'src/shared/utils/error.util';

export const discordReadExecute = async ({
	format,
	data,
	config,
}: GeneralNodePropsType<DiscordReadDataType, DiscordReadConfigType>): Promise<
	DefaultReturnType<GeneralNodeReturnType>
> => {
	try {
		const validate = await discordReadValidate({
			format,
			data,
			config,
		});
		if (isError(validate)) {
			return {
				...validate,
				trace: [...validate.trace, 'discordReadExecute - discordReadValidate'],
			};
		}

		const { channel_id, bot_token } = validate.config;

		const authHeader = `Bot ${bot_token}`;

		const response = await axios.get(`https://discord.com/api/v10/channels/${channel_id}/messages`, {
			params: { limit: WORKFLOW_SYSTEM.DISCORD_READ_LIMIT },
			headers: {
				Authorization: authHeader,
				'Content-Type': 'application/json',
			},
		});

		if (!Array.isArray(response.data)) {
			return {
				userMessage: 'Error reading messages from Discord!',
				error: response.data.error || 'Error reading messages from Discord!',
				errorType: 'BadRequestException',
				errorData: { error: response.data.error || 'Error reading messages from Discord!' },
				trace: ['discordReadExecute - if (!Array.isArray(response.data))'],
			};
		}

		const messages = response.data.map((msg: any) => ({
			id: msg.id,
			content: msg.content,
			author: msg.author.username,
			timestamp: msg.timestamp,
		}));

		return { status: 'success', format: 'object', content: { defaultData: messages } };
	} catch (error) {
		return {
			userMessage: 'Internal server error!',
			error: 'Internal server error!',
			errorType: 'InternalServerErrorException',
			errorData: {
				error: returnErrorString(error),
			},
			trace: ['discordReadExecute - catch'],
		};
	}
};
