import { OpenAI } from 'openai';

import { OpenAiConfigType, OpenAiDataType, openAiValidate } from './validate';
import { GeneralNodePropsType, GeneralNodeReturnType } from 'src/workflow-system/workflow-system.type';
import { DefaultReturnType } from 'src/shared/types/return.type';
import { returnErrorString } from 'src/shared/utils/return.util';
import { isError } from 'src/shared/utils/error.util';

export const openAiExecute = async ({
	format,
	data,
	config,
}: GeneralNodePropsType<OpenAiDataType, OpenAiConfigType>): Promise<DefaultReturnType<GeneralNodeReturnType>> => {
	try {
		const validate = await openAiValidate({
			format,
			data,
			config,
		});
		if (isError(validate)) {
			return {
				...validate,
				trace: [...validate.trace, 'openAiExecute - openAiValidate'],
			};
		}

		const { apiKey, model, systemPrompt = '' } = validate.config;
		const { defaultData } = validate.data;

		const formattedDefaultData = typeof defaultData === 'string' ? defaultData : JSON.stringify(defaultData);

		const openai = new OpenAI({ apiKey });

		const completion = await openai.chat.completions.create({
			model,
			messages: [{ role: 'user', content: `${formattedDefaultData}. ${systemPrompt}` }],
		});

		const response = completion.choices[0]?.message?.content?.trim() || 'No response generated';

		return { status: 'success', format: 'string', content: { defaultData: response } };
	} catch (error) {
		return {
			userMessage: 'Internal server error!',
			error: 'Internal server error!',
			errorType: 'InternalServerErrorException',
			errorData: {
				error: returnErrorString(error),
			},
			trace: ['openAiExecute - catch'],
		};
	}
};
