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

const pdfGeneratorValidationSchema = z.object({
	format: z.enum(responderDataFormats, { message: 'Invalid format' }),
	data: z.object(
		{ defaultData: z.unknown({ message: 'Invalid content' }) },
		{ message: 'Invalid pdf generator data' },
	),
	config: z.object({}),
});

export type PdfGeneratorDataType = z.infer<typeof pdfGeneratorValidationSchema>['data'] & { defaultData: unknown };
export type PdfGeneratorConfigType = z.infer<typeof pdfGeneratorValidationSchema>['config'];

export const pdfGeneratorValidate = async ({
	format,
	data,
	config,
}: GeneralNodePropsType<PdfGeneratorDataType, PdfGeneratorConfigType>): Promise<
	DefaultReturnType<GeneralNodeValidateReturnType<PdfGeneratorDataType, PdfGeneratorConfigType>>
> => {
	const parsedDefaultData =
		format === 'json' ? parseJson(data.defaultData) : { status: 'success', data: data.defaultData };
	if (isError(parsedDefaultData)) {
		return {
			...parsedDefaultData,
			trace: [...parsedDefaultData.trace, 'pdfGeneratorValidate - parseJson'],
		} as DefaultReturnType<GeneralNodeValidateReturnType<PdfGeneratorDataType, PdfGeneratorConfigType>>;
	}

	const validationResult = validate({ data: { format, data, config }, schema: pdfGeneratorValidationSchema });
	if (isError(validationResult)) {
		return {
			...validationResult,
			trace: [...validationResult.trace, 'pdfGeneratorValidate - pdfGeneratorValidationSchema'],
		};
	}

	return {
		format: validationResult.format,
		data: { ...validationResult.data, defaultData: parsedDefaultData },
		config: validationResult.config,
	};
};
