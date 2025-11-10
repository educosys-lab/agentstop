import { z } from 'zod';

import { parseJson } from 'src/shared/utils/json.util';
import {
	GeneralNodePropsType,
	GeneralNodeValidateReturnType,
	responderDataFormats,
} from 'src/workflow-system/workflow-system.type';
import { validate } from 'src/shared/utils/zod.util';
import { DefaultReturnType } from 'src/shared/types/return.type';
import { isError } from 'src/shared/utils/error.util';

const youTubeTranscribeValidationSchema = z.object({
	format: z.enum(responderDataFormats, { message: 'Invalid format' }),
	data: z.object(
		{ defaultData: z.unknown({ message: 'Invalid content' }) },
		{ message: 'Invalid youtube transcribe data' },
	),
	config: z.object(
		{
			api_key: z.string({ message: 'Invalid API key' }).min(1, { message: 'Gemini API key is required' }),
			video_url: z
				.string({ message: 'Invalid video URL' })
				.min(1, { message: 'YouTube video URL is required' })
				.regex(/^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\/.+$/, { message: 'Invalid YouTube URL format' }),
		},
		{ message: 'Invalid youtube transcribe config' },
	),
});

export type YouTubeTranscribeDataType = z.infer<typeof youTubeTranscribeValidationSchema>['data'] & {
	defaultData: unknown;
};
export type YouTubeTranscribeConfigType = z.infer<typeof youTubeTranscribeValidationSchema>['config'];

export const youTubeTranscribeValidate = async ({
	format,
	data,
	config,
}: GeneralNodePropsType<YouTubeTranscribeDataType, YouTubeTranscribeConfigType>): Promise<
	DefaultReturnType<GeneralNodeValidateReturnType<YouTubeTranscribeDataType, YouTubeTranscribeConfigType>>
> => {
	const parsedDefaultData =
		format === 'json' ? parseJson(data.defaultData) : { status: 'success', data: data.defaultData };
	if (isError(parsedDefaultData)) {
		return {
			...parsedDefaultData,
			trace: [...parsedDefaultData.trace, 'youTubeTranscribeValidate - parseJson'],
		} as DefaultReturnType<GeneralNodeValidateReturnType<YouTubeTranscribeDataType, YouTubeTranscribeConfigType>>;
	}

	const validationResult = validate({ data: { format, data, config }, schema: youTubeTranscribeValidationSchema });
	if (isError(validationResult)) {
		return {
			...validationResult,
			trace: [...validationResult.trace, 'youTubeTranscribeValidate - youTubeTranscribeValidationSchema'],
		} as DefaultReturnType<GeneralNodeValidateReturnType<YouTubeTranscribeDataType, YouTubeTranscribeConfigType>>;
	}

	return {
		format: validationResult.format,
		data: { ...validationResult.data, defaultData: parsedDefaultData },
		config: validationResult.config,
	};
};
