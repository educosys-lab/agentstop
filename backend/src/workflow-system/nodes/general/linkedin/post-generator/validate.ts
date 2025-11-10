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

const linkedInPostValidationSchema = z.object({
	format: z.enum(responderDataFormats, { message: 'Invalid format' }),
	data: z.object(
		{ defaultData: z.unknown({ message: 'Invalid content' }) },
		{ message: 'Invalid linkedIn post data' },
	),
	config: z.object(
		{
			auth_type: z.literal('linkedin_oauth', { message: 'Invalid auth type' }),
			access_token: z.string({ message: 'Invalid access token' }).min(1, { message: 'Access token is required' }),
		},
		{ message: 'Invalid linkedIn post config' },
	),
});

export type LinkedInPostDataType = z.infer<typeof linkedInPostValidationSchema>['data'] & { defaultData: unknown };
export type LinkedInPostConfigType = z.infer<typeof linkedInPostValidationSchema>['config'];

export const linkedInPostValidate = async ({
	format,
	data,
	config,
}: GeneralNodePropsType<LinkedInPostDataType, LinkedInPostConfigType>): Promise<
	DefaultReturnType<GeneralNodeValidateReturnType<LinkedInPostDataType, LinkedInPostConfigType>>
> => {
	const parsedDefaultData =
		format === 'json' ? parseJson(data.defaultData) : { status: 'success', data: data.defaultData };
	if (isError(parsedDefaultData)) {
		return {
			...parsedDefaultData,
			trace: [...parsedDefaultData.trace, 'linkedInPostValidate - parseJson'],
		} as DefaultReturnType<GeneralNodeValidateReturnType<LinkedInPostDataType, LinkedInPostConfigType>>;
	}

	const validationResult = validate({ data: { format, data, config }, schema: linkedInPostValidationSchema });
	if (isError(validationResult)) {
		return {
			...validationResult,
			trace: [...validationResult.trace, 'linkedInPostValidate - linkedInPostValidationSchema'],
		};
	}

	return {
		format: validationResult.format,
		data: { ...validationResult.data, defaultData: parsedDefaultData },
		config: validationResult.config,
	};
};
