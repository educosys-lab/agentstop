import { z } from 'zod';

import { validate } from 'src/shared/utils/zod.util';
import {
	GeneralNodePropsType,
	GeneralNodeValidateReturnType,
	responderDataFormats,
} from 'src/workflow-system/workflow-system.type';
import { parseJson } from 'src/shared/utils/json.util';
import { DefaultReturnType } from 'src/shared/types/return.type';
import { isError } from 'src/shared/utils/error.util';
import { RagIngestionSourceTypeEnum } from './rag-ingestion.type';

const ragIngestionValidationSchema = z.object({
	format: z.enum(responderDataFormats, { message: 'Invalid format' }),
	data: z.object(
		{ defaultData: z.unknown({ message: 'Invalid content' }) },
		{ message: 'Invalid rag ingestion data' },
	),
	config: z.object(
		{
			sourceType: z.nativeEnum(RagIngestionSourceTypeEnum, { message: 'Invalid source type' }),
			text: z.string({ message: 'Invalid text' }).optional(),
			url: z.string({ message: 'Invalid url' }).optional(),
			sourceName: z.string({ message: 'Invalid source name' }),
		},
		{ message: 'Invalid rag ingestion config' },
	),
});

export type RagIngestionDataType = z.infer<typeof ragIngestionValidationSchema>['data'] & { defaultData: unknown };
export type RagIngestionConfigType = z.infer<typeof ragIngestionValidationSchema>['config'];

export const ragIngestionValidate = async ({
	format,
	data,
	config,
}: GeneralNodePropsType<RagIngestionDataType, RagIngestionConfigType>): Promise<
	DefaultReturnType<GeneralNodeValidateReturnType<RagIngestionDataType, RagIngestionConfigType>>
> => {
	const parsedDefaultData =
		format === 'json' ? parseJson(data.defaultData) : { status: 'success', data: data.defaultData };
	if (isError(parsedDefaultData)) {
		return {
			...parsedDefaultData,
			trace: [...parsedDefaultData.trace, 'ragIngestionValidate - parseJson'],
		} as DefaultReturnType<GeneralNodeValidateReturnType<RagIngestionDataType, RagIngestionConfigType>>;
	}

	const validationResult = validate({ data: { format, data, config }, schema: ragIngestionValidationSchema });
	if (isError(validationResult)) {
		return {
			...validationResult,
			trace: [...validationResult.trace, 'ragIngestionValidate - ragIngestionValidationSchema'],
		};
	}

	return {
		format: validationResult.format,
		data: { ...validationResult.data, defaultData: parsedDefaultData },
		config: validationResult.config,
	};
};
