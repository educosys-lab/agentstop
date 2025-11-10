import { z } from 'zod';
import { validate } from 'src/shared/utils/zod.util';
import {
	responderDataFormats,
	ResponderNodePropsType,
	ResponderNodeValidateReturnType,
} from 'src/workflow-system/workflow-system.type';
import { parseJson } from 'src/shared/utils/json.util';
import { DefaultReturnType } from 'src/shared/types/return.type';
import { isError } from 'src/shared/utils/error.util';

const googleSheetsResponderValidationSchema = z.object({
	format: z.enum(responderDataFormats, { message: 'Invalid format' }),
	data: z.object(
		{ defaultData: z.unknown({ message: 'Invalid content' }) },
		{ message: 'Invalid google sheets responder data' },
	),
	config: z.object(
		{
			nodeId: z.string({ message: 'Invalid trigger node ID' }).min(1, { message: 'Trigger node ID is required' }),
			type: z.literal('google-sheets', { message: 'Invalid type' }),
			auth_type: z.enum(['google_signin', 'google_manual'], { message: 'Invalid auth type' }).optional(),
			access_token: z.string({ message: 'Invalid access token' }).min(1, { message: 'Access token is required' }),
			refresh_token: z
				.string({ message: 'Invalid refresh token' })
				.min(1, { message: 'Refresh token is required' }),
			file_id: z.string({ message: 'Invalid sheet ID' }).min(1, { message: 'Sheet ID is required' }),
			range: z.string({ message: 'Invalid range' }).optional(),
			webhook_url: z.string({ message: 'Invalid webhook URL' }),
		},
		{ message: 'Invalid google sheets responder config' },
	),
});

export type GoogleSheetsResponderDataType = z.infer<typeof googleSheetsResponderValidationSchema>['data'] & {
	defaultData: unknown;
};
export type GoogleSheetsResponderConfigType = z.infer<typeof googleSheetsResponderValidationSchema>['config'];

export const googleSheetsResponderValidate = async ({
	format,
	data,
	config,
}: ResponderNodePropsType<GoogleSheetsResponderDataType, GoogleSheetsResponderConfigType>): Promise<
	DefaultReturnType<ResponderNodeValidateReturnType<GoogleSheetsResponderDataType, GoogleSheetsResponderConfigType>>
> => {
	const parsedDefaultData = format === 'json' ? parseJson(data.defaultData) : data.defaultData;
	if (isError(parsedDefaultData)) {
		return {
			...parsedDefaultData,
			trace: [...parsedDefaultData.trace, 'googleSheetsResponderValidate - parseJson'],
		} as DefaultReturnType<
			ResponderNodeValidateReturnType<GoogleSheetsResponderDataType, GoogleSheetsResponderConfigType>
		>;
	}

	const validationResult = validate({
		data: { format, data, config },
		schema: googleSheetsResponderValidationSchema,
	});
	if (isError(validationResult)) {
		return {
			...validationResult,
			trace: [...validationResult.trace, 'googleSheetsResponderValidate - validate'],
		};
	}

	return {
		format: validationResult.format,
		data: { ...validationResult.data, defaultData: parsedDefaultData },
		config: validationResult.config,
	};
};
