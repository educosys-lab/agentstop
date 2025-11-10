import { z } from 'zod';

import { validate } from 'src/shared/utils/zod.util';
import {
	GeneralNodePropsType,
	GeneralNodeValidateReturnType,
	responderDataFormats,
} from 'src/workflow-system/workflow-system.type';
import { DefaultReturnType } from 'src/shared/types/return.type';
import { isError } from 'src/shared/utils/error.util';

const googleDocsReadValidationSchema = z.object({
	format: z.enum(responderDataFormats, { message: 'Invalid format' }),
	data: z.object(
		{ defaultData: z.unknown({ message: 'Invalid content' }) },
		{ message: 'Invalid google docs read data' },
	),
	config: z.object(
		{
			auth_type: z.enum(['google_signin', 'google_manual'], { message: 'Invalid auth type' }),
			access_token: z.string({ message: 'Invalid access token' }).min(1, { message: 'Access token is required' }),
			file_id: z.string({ message: 'Invalid file ID' }).min(1, { message: 'File ID is required' }),
		},
		{ message: 'Invalid google docs read config' },
	),
});

export type GoogleDocsReadDataType = z.infer<typeof googleDocsReadValidationSchema>['data'] & { defaultData: unknown };
export type GoogleDocsReadConfigType = z.infer<typeof googleDocsReadValidationSchema>['config'];

export const googleDocsReadValidate = async ({
	format,
	data,
	config,
}: GeneralNodePropsType<GoogleDocsReadDataType, GoogleDocsReadConfigType>): Promise<
	DefaultReturnType<GeneralNodeValidateReturnType<GoogleDocsReadDataType, GoogleDocsReadConfigType>>
> => {
	const validationResult = validate({ data: { format, data, config }, schema: googleDocsReadValidationSchema });
	if (isError(validationResult)) {
		return {
			...validationResult,
			trace: [...validationResult.trace, 'googleDocsReadValidate - validate'],
		};
	}

	return {
		format: validationResult.format,
		data: { ...validationResult.data, defaultData: validationResult.data.defaultData },
		config: validationResult.config,
	};
};
