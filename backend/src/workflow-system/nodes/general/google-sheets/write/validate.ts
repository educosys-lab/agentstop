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

const googleSheetsWriteValidationSchema = z.object({
	format: z.enum(responderDataFormats, { message: 'Invalid format' }),
	data: z.object(
		{
			defaultData: z.unknown({ message: 'Document content is required' }),
			google_sheets_range_ifAny: z.string({ message: 'Invalid range' }).optional(),
		},
		{ message: 'Invalid google sheets write data' },
	),
	config: z.object(
		{
			auth_type: z.enum(['google_signin', 'google_manual'], { message: 'Invalid auth type' }),
			access_token: z.string({ message: 'Invalid access token' }).min(1, { message: 'Access token is required' }),
			file_id: z.string({ message: 'Invalid file ID' }).min(1, { message: 'File ID is required' }),
			google_sheets_range_from_config: z.string({ message: 'Invalid range' }).optional(),
		},
		{ message: 'Invalid google sheets write config' },
	),
});

export type GoogleSheetsWriteDataType = z.infer<typeof googleSheetsWriteValidationSchema>['data'] & {
	defaultData: unknown;
};
export type GoogleSheetsWriteConfigType = z.infer<typeof googleSheetsWriteValidationSchema>['config'];

export const googleSheetsWriteValidate = async ({
	format,
	data,
	config,
}: GeneralNodePropsType<GoogleSheetsWriteDataType, GoogleSheetsWriteConfigType>): Promise<
	DefaultReturnType<GeneralNodeValidateReturnType<GoogleSheetsWriteDataType, GoogleSheetsWriteConfigType>>
> => {
	const parsedDefaultData =
		format === 'json' ? parseJson(data.defaultData) : { status: 'success', data: data.defaultData };
	if (isError(parsedDefaultData)) {
		return {
			...parsedDefaultData,
			trace: [...parsedDefaultData.trace, 'googleSheetsWriteValidate - parseJson'],
		} as DefaultReturnType<GeneralNodeValidateReturnType<GoogleSheetsWriteDataType, GoogleSheetsWriteConfigType>>;
	}

	const validationResult = validate({ data: { format, data, config }, schema: googleSheetsWriteValidationSchema });
	if (isError(validationResult)) {
		return {
			...validationResult,
			trace: [...validationResult.trace, 'googleSheetsWriteValidate - validate'],
		};
	}

	return {
		format: validationResult.format,
		data: { ...validationResult.data, defaultData: parsedDefaultData },
		config: validationResult.config,
	};
};
