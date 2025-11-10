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

const ragQueryValidationSchema = z.object({
	format: z.enum(responderDataFormats, { message: 'Invalid format' }),
	data: z.object(
		{
			defaultData: z.unknown({ message: 'Invalid content' }),
			userId: z.string({ message: 'Invalid user ID' }),
		},
		{ message: 'Invalid rag query data' },
	),
	config: z.object(
		{
			sourceName: z.string({ message: 'Invalid source name' }).array(),
		},
		{ message: 'Invalid rag query config' },
	),
});

export type RagQueryDataType = z.infer<typeof ragQueryValidationSchema>['data'] & { defaultData: unknown };
export type RagQueryConfigType = z.infer<typeof ragQueryValidationSchema>['config'];

export const ragQueryValidate = async ({
	format,
	data,
	config,
}: GeneralNodePropsType<RagQueryDataType, RagQueryConfigType>): Promise<
	DefaultReturnType<GeneralNodeValidateReturnType<RagQueryDataType, RagQueryConfigType>>
> => {
	const parsedDefaultData =
		format === 'json' ? parseJson(data.defaultData) : { status: 'success', data: data.defaultData };
	if (isError(parsedDefaultData)) {
		return {
			...parsedDefaultData,
			trace: [...parsedDefaultData.trace, 'ragQueryValidate - parseJson'],
		} as DefaultReturnType<GeneralNodeValidateReturnType<RagQueryDataType, RagQueryConfigType>>;
	}

	const validationResult = validate({ data: { format, data, config }, schema: ragQueryValidationSchema });
	if (isError(validationResult)) {
		return {
			...validationResult,
			trace: [...validationResult.trace, 'ragQueryValidate - ragQueryValidationSchema'],
		};
	}

	return {
		format: validationResult.format,
		data: { ...validationResult.data, defaultData: parsedDefaultData },
		config: validationResult.config,
	};
};
