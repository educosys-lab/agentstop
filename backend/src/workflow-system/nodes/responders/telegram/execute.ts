import { Telegraf } from 'telegraf';
// import { InputFile } from 'telegraf/typings/core/types/typegram';

import { TelegramResponderConfigType, TelegramResponderDataType, telegramResponderValidate } from './validate';
import { formatLLMResponseToText } from 'src/shared/utils/ai.util';
import { splitText } from 'src/shared/utils/string.util';
import { ResponderNodePropsType, ResponderNodeReturnType } from 'src/workflow-system/workflow-system.type';
import { WORKFLOW_SYSTEM } from 'src/workflow-system/workflow-system.constant';
import { isError } from 'src/shared/utils/error.util';
import { DefaultReturnType } from 'src/shared/types/return.type';
import { returnErrorString } from 'src/shared/utils/return.util';

export const telegramResponderExecute = async ({
	format,
	data,
	config,
}: ResponderNodePropsType<TelegramResponderDataType, TelegramResponderConfigType>): Promise<
	DefaultReturnType<ResponderNodeReturnType>
> => {
	try {
		const validate = await telegramResponderValidate({ format, data, config });
		if (isError(validate)) {
			return {
				...validate,
				trace: [...validate.trace, 'telegramResponderExecute - telegramResponderValidate'],
			};
		}

		const { defaultData } = validate.data;
		const { chatId, accessToken } = validate.config;

		const formattedDefaultData =
			typeof defaultData === 'string' ? formatLLMResponseToText(defaultData) : JSON.stringify(defaultData);
		if (isError(formattedDefaultData)) {
			return {
				...formattedDefaultData,
				trace: [...formattedDefaultData.trace, 'telegramResponderExecute - formatLLMResponseToText'],
			};
		}

		const bot = new Telegraf(accessToken);

		// switch (validFormat) {
		// 	case 'string': {
		// 		const chunks = splitText(cleanedContent, WORKFLOW_SYSTEM.TELEGRAM_MESSAGE_LIMIT);
		// 		for (const chunk of chunks) {
		// 			await bot.telegram.sendMessage(chatId, chunk);
		// 		}
		// 		break;
		// 	}
		// 	case 'document':
		// 		await bot.telegram.sendDocument(chatId, { source: data, filename: 'myfile.txt' });
		// 		break;
		// 	case 'image':
		// 		await bot.telegram.sendPhoto(chatId, data as InputFile);
		// 		break;
		// 	case 'audio':
		// 		await bot.telegram.sendAudio(chatId, data as InputFile);
		// 		break;
		// 	case 'video':
		// 		await bot.telegram.sendVideo(chatId, data as InputFile);
		// 		break;
		// 	default:
		// 		return { status: 'failed', format: 'string', content: 'Invalid type' };
		// }

		const chunks = splitText(formattedDefaultData, WORKFLOW_SYSTEM.TELEGRAM_MESSAGE_LIMIT);
		for (const chunk of chunks) {
			await bot.telegram.sendMessage(chatId, chunk);
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
				format,
				data,
				config,
				error: returnErrorString(error),
			},
			trace: ['telegramResponderExecute - catch'],
		};
	}
};
