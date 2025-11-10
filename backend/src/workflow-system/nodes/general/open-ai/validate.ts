import { z } from 'zod';

import { validate } from 'src/shared/utils/zod.util';
import {
	GeneralNodePropsType,
	GeneralNodeValidateReturnType,
	responderDataFormats,
} from 'src/workflow-system/workflow-system.type';
import { parseJson } from 'src/shared/utils/json.util';
import { OpenAiOptionsEnum } from './open-ai.type';
import { DefaultReturnType } from 'src/shared/types/return.type';
import { isError } from 'src/shared/utils/error.util';

const openAiValidationSchema = z.object({
	format: z.enum(responderDataFormats, { message: 'Invalid format' }),
	data: z.object({ defaultData: z.unknown({ message: 'Invalid content' }) }, { message: 'Invalid openAI data' }),
	config: z.object(
		{
			apiKey: z.string({ message: 'Invalid API key' }).min(1, { message: 'API key is required' }),
			model: z.nativeEnum(OpenAiOptionsEnum, { message: 'Invalid model' }),
			systemPrompt: z.string({ message: 'Invalid system prompt' }).optional(),
		},
		{ message: 'Invalid openAI config' },
	),
});

export type OpenAiDataType = z.infer<typeof openAiValidationSchema>['data'] & { defaultData: unknown };
export type OpenAiConfigType = z.infer<typeof openAiValidationSchema>['config'];

export const openAiValidate = async ({
	format,
	data,
	config,
}: GeneralNodePropsType<OpenAiDataType, OpenAiConfigType>): Promise<
	DefaultReturnType<GeneralNodeValidateReturnType<OpenAiDataType, OpenAiConfigType>>
> => {
	const parsedDefaultData =
		format === 'json' ? parseJson(data.defaultData) : { status: 'success', data: data.defaultData };
	if (isError(parsedDefaultData)) {
		return {
			...parsedDefaultData,
			trace: [...parsedDefaultData.trace, 'openAiValidate - parseJson'],
		} as DefaultReturnType<GeneralNodeValidateReturnType<OpenAiDataType, OpenAiConfigType>>;
	}

	const validationResult = validate({ data: { format, data, config }, schema: openAiValidationSchema });
	if (isError(validationResult)) {
		return {
			...validationResult,
			trace: [...validationResult.trace, 'openAiValidate - openAiValidationSchema'],
		};
	}

	return {
		format: validationResult.format,
		data: { ...validationResult.data, defaultData: parsedDefaultData },
		config: validationResult.config,
	};
};
