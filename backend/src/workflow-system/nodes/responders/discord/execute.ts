import axios from 'axios';

import { DiscordResponderConfigType, DiscordResponderDataType, discordResponderValidate } from './validate';
import { splitText } from 'src/shared/utils/string.util';
import { ResponderNodePropsType, ResponderNodeReturnType } from 'src/workflow-system/workflow-system.type';
import { formatLLMResponseToText } from 'src/shared/utils/ai.util';
import { WORKFLOW_SYSTEM } from 'src/workflow-system/workflow-system.constant';
import { DefaultReturnType } from 'src/shared/types/return.type';
import { returnErrorString } from 'src/shared/utils/return.util';
import { isError } from 'src/shared/utils/error.util';

export const discordResponderExecute = async ({
	format,
	data,
	config,
}: ResponderNodePropsType<DiscordResponderDataType, DiscordResponderConfigType>): Promise<
	DefaultReturnType<ResponderNodeReturnType>
> => {
	try {
		const validate = await discordResponderValidate({ format, data, config });
		if (isError(validate)) {
			return {
				...validate,
				trace: [...validate.trace, 'discordResponderExecute - discordResponderValidate'],
			};
		}

		const { defaultData } = validate.data;
		const { bot_token, channel_id, message_id } = validate.config;

		const formattedDefaultData =
			typeof defaultData === 'string' ? formatLLMResponseToText(defaultData) : JSON.stringify(defaultData);
		if (isError(formattedDefaultData)) {
			return {
				...formattedDefaultData,
				trace: [...formattedDefaultData.trace, 'discordResponderExecute - formatLLMResponseToText'],
			};
		}

		const authHeader = `Bot ${bot_token}`;

		// switch (format) {
		// 	case 'string': {
		// 		const chunks = splitText(cleanedContent, WORKFLOW_SYSTEM.DISCORD_MESSAGE_LIMIT || 2000);
		// 		for (const chunk of chunks) {
		// 			await axios.post(
		// 				`https://discord.com/api/v10/channels/${channel_id}/messages`,
		// 				{ content: chunk },
		// 				{ headers: { Authorization: authHeader, 'Content-Type': 'application/json' } },
		// 			);
		// 		}
		// 		break;
		// 	}
		// 	case 'document': {
		// 		const buffer = Buffer.from(cleanedContent);
		// 		const formData = new FormData();
		// 		formData.append('file', new Blob([buffer]), 'myfile.txt');
		// 		await axios.post(`https://discord.com/api/v10/channels/${channel_id}/messages`, formData, {
		// 			headers: { Authorization: authHeader, 'Content-Type': 'multipart/form-data' },
		// 		});
		// 		break;
		// 	}
		// 	case 'image':
		// 	case 'audio':
		// 	case 'video': {
		// 		await axios.post(
		// 			`https://discord.com/api/v10/channels/${channel_id}/messages`,
		// 			{ content: '', attachments: [{ url: content }] },
		// 			{ headers: { Authorization: authHeader, 'Content-Type': 'application/json' } },
		// 		);
		// 		break;
		// 	}
		// 	default: {
		// 		return { status: 'failed', format: 'string', content: 'Invalid type' };
		// 	}
		// }

		const chunks = splitText(formattedDefaultData, WORKFLOW_SYSTEM.DISCORD_MESSAGE_LIMIT);
		for (const chunk of chunks) {
			await axios.post(
				`https://discord.com/api/v10/channels/${channel_id}/messages`,
				{
					content: chunk,
					message_reference: message_id ? { message_id } : undefined,
				},
				{ headers: { Authorization: authHeader, 'Content-Type': 'application/json' } },
			);
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
			trace: ['discordResponderExecute - catch'],
		};
	}
};
