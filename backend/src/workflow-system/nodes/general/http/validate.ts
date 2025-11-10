import { z } from 'zod';

import { validate } from 'src/shared/utils/zod.util';
import {
	GeneralNodePropsType,
	GeneralNodeValidateReturnType,
	responderDataFormats,
} from 'src/workflow-system/workflow-system.type';
import { DefaultReturnType } from 'src/shared/types/return.type';
import { isError } from 'src/shared/utils/error.util';

const httpValidationSchema = z.object({
	format: z.enum(responderDataFormats, { message: 'Invalid format' }),
	data: z.object({ defaultData: z.unknown({ message: 'Invalid content' }) }, { message: 'Invalid http data' }),
	config: z.object(
		{
			url: z.string({ message: 'Invalid URL' }).url().min(1, { message: 'URL is required' }),
			method: z.enum(['GET', 'POST', 'PATCH', 'PUT', 'DELETE'], { message: 'Invalid method' }),
			headers: z.string({ message: 'Invalid headers' }).optional(),
			body: z.string({ message: 'Invalid body' }).optional(),
		},
		{ message: 'Invalid http config' },
	),
});

export type HttpDataType = z.infer<typeof httpValidationSchema>['data'] & { defaultData: unknown };
export type HttpConfigType = z.infer<typeof httpValidationSchema>['config'];

export const httpValidate = async ({
	format,
	data,
	config,
}: GeneralNodePropsType<HttpDataType, HttpConfigType>): Promise<
	DefaultReturnType<GeneralNodeValidateReturnType<HttpDataType, HttpConfigType>>
> => {
	const validationResult = validate({ data: { format, data, config }, schema: httpValidationSchema });
	if (isError(validationResult)) {
		return {
			...validationResult,
			trace: [...validationResult.trace, 'httpValidate - httpValidationSchema'],
		};
	}

	return {
		format: validationResult.format,
		data: { ...validationResult.data, defaultData: validationResult.data.defaultData },
		config: validationResult.config,
	};
};
