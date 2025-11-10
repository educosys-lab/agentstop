import { z } from 'zod';

import { validate } from 'src/shared/utils/zod.util';
import {
	GeneralNodePropsType,
	GeneralNodeValidateReturnType,
	responderDataFormats,
} from 'src/workflow-system/workflow-system.type';
import { DefaultReturnType } from 'src/shared/types/return.type';
import { isError } from 'src/shared/utils/error.util';

const googleSheetsReadValidationSchema = z.object({
	format: z.enum(responderDataFormats, { message: 'Invalid format' }),
	data: z.object(
		{ defaultData: z.unknown({ message: 'Invalid content' }) },
		{ message: 'Invalid google sheets read data' },
	),
	config: z.object(
		{
			auth_type: z.enum(['google_signin', 'google_manual'], { message: 'Invalid auth type' }),
			access_token: z.string({ message: 'Invalid access token' }).min(1, { message: 'Access token is required' }),
			file_id: z.string({ message: 'Invalid file ID' }).min(1, { message: 'File ID is required' }),
			range: z.string({ message: 'Invalid range' }).optional(),
		},
		{ message: 'Invalid google sheets read config' },
	),
});

export type GoogleSheetsReadDataType = z.infer<typeof googleSheetsReadValidationSchema>['data'] & {
	defaultData: unknown;
};
export type GoogleSheetsReadConfigType = z.infer<typeof googleSheetsReadValidationSchema>['config'];

export const googleSheetsReadValidate = async ({
	format,
	data,
	config,
}: GeneralNodePropsType<GoogleSheetsReadDataType, GoogleSheetsReadConfigType>): Promise<
	DefaultReturnType<GeneralNodeValidateReturnType<GoogleSheetsReadDataType, GoogleSheetsReadConfigType>>
> => {
	const validationResult = validate({ data: { format, data, config }, schema: googleSheetsReadValidationSchema });
	if (isError(validationResult)) {
		return { ...validationResult, trace: [...validationResult.trace, 'googleSheetsReadValidate - validate'] };
	}

	return {
		format: validationResult.format,
		data: { ...validationResult.data, defaultData: validationResult.data.defaultData },
		config: validationResult.config,
	};
};
