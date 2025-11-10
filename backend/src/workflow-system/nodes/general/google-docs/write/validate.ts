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

const googleDocsWriteValidationSchema = z.object({
	format: z.enum(responderDataFormats, { message: 'Invalid format' }),
	data: z.object(
		{ defaultData: z.unknown({ message: 'Invalid content' }) },
		{ message: 'Invalid google docs write data' },
	),
	config: z.object(
		{
			auth_type: z.enum(['google_signin', 'google_manual'], { message: 'Invalid auth type' }),
			access_token: z.string({ message: 'Invalid access token' }).min(1, { message: 'Access token is required' }),
			file_id: z.string({ message: 'Invalid file ID' }).min(1, { message: 'File ID is required' }),
		},
		{ message: 'Invalid google docs write config' },
	),
});

export type GoogleDocsWriteDataType = z.infer<typeof googleDocsWriteValidationSchema>['data'] & {
	defaultData: unknown;
};
export type GoogleDocsWriteConfigType = z.infer<typeof googleDocsWriteValidationSchema>['config'];

export const googleDocsWriteValidate = async ({
	format,
	data,
	config,
}: GeneralNodePropsType<GoogleDocsWriteDataType, GoogleDocsWriteConfigType>): Promise<
	DefaultReturnType<GeneralNodeValidateReturnType<GoogleDocsWriteDataType, GoogleDocsWriteConfigType>>
> => {
	const parsedDefaultData =
		format === 'json' ? parseJson(data.defaultData) : { status: 'success', data: data.defaultData };
	if (isError(parsedDefaultData)) {
		return {
			...parsedDefaultData,
			trace: [...parsedDefaultData.trace, 'googleDocsWriteValidate - parseJson'],
		} as DefaultReturnType<GeneralNodeValidateReturnType<GoogleDocsWriteDataType, GoogleDocsWriteConfigType>>;
	}

	const validationResult = validate({ data: { format, data, config }, schema: googleDocsWriteValidationSchema });
	if (isError(validationResult)) {
		return {
			...validationResult,
			trace: [...validationResult.trace, 'googleDocsWriteValidate - validate'],
		};
	}

	return {
		format: validationResult.format,
		data: { ...validationResult.data, defaultData: parsedDefaultData },
		config: validationResult.config,
	};
};
