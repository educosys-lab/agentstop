import { z } from 'zod';

import { validate } from 'src/shared/utils/zod.util';
import {
	GeneralNodePropsType,
	GeneralNodeValidateReturnType,
	responderDataFormats,
} from 'src/workflow-system/workflow-system.type';
import { DefaultReturnType } from 'src/shared/types/return.type';
import { isError } from 'src/shared/utils/error.util';

const gmailReadValidationSchema = z.object({
	format: z.enum(responderDataFormats, { message: 'Invalid format' }),
	data: z.object({ defaultData: z.unknown({ message: 'Invalid content' }) }, { message: 'Invalid gmail read data' }),
	config: z.object({
		auth_type: z.enum(['google_signin', 'google_manual'], { message: 'Invalid auth type' }),
		access_token: z.string({ message: 'Invalid access token' }).min(1, { message: 'Access token is required' }),
		criteria: z.enum(['all', 'read', 'unread'], { message: 'Invalid criteria' }),
		mark_as_read: z.enum(['yes', 'no'], { message: 'Invalid mark as read' }),
		keyword: z.string({ message: 'Invalid keyword' }).optional(),
		max_results: z.string({ message: 'Invalid max results' }).optional(),
	}),
});

export type GmailReadDataType = z.infer<typeof gmailReadValidationSchema>['data'] & { defaultData: unknown };
export type GmailReadConfigType = z.infer<typeof gmailReadValidationSchema>['config'];

export const gmailReadValidate = async ({
	format,
	data,
	config,
}: GeneralNodePropsType<GmailReadDataType, GmailReadConfigType>): Promise<
	DefaultReturnType<GeneralNodeValidateReturnType<GmailReadDataType, GmailReadConfigType>>
> => {
	const validationResult = validate({ data: { format, data, config }, schema: gmailReadValidationSchema });
	if (isError(validationResult)) {
		return {
			...validationResult,
			trace: [...validationResult.trace, 'gmailReadValidate - validate'],
		};
	}

	return {
		format: validationResult.format,
		data: { ...validationResult.data, defaultData: validationResult.data.defaultData },
		config: validationResult.config,
	};
};
