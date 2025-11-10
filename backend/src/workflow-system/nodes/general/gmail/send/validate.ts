import { z } from 'zod';

import { validate } from 'src/shared/utils/zod.util';
import {
	GeneralNodePropsType,
	GeneralNodeValidateReturnType,
	responderDataFormats,
} from 'src/workflow-system/workflow-system.type';
import { DefaultReturnType } from 'src/shared/types/return.type';
import { isError } from 'src/shared/utils/error.util';

const gmailSendValidationSchema = z
	.object({
		format: z.enum(responderDataFormats, { message: 'Invalid format' }),
		data: z.object(
			{
				defaultData: z.unknown({ message: 'Invalid content' }),
				to_email_addresses: z.string({ message: 'Invalid to email addresses' }).optional(),
				cc_email_addresses_ifAny: z.string({ message: 'Invalid cc email addresses' }).optional(),
				bcc_email_addresses_ifAny: z.string({ message: 'Invalid bcc email addresses' }).optional(),
				subject_of_email: z.string({ message: 'Invalid subject of email' }).optional(),
				body_of_email: z.string({ message: 'Invalid body of email' }).optional(),
			},
			{ message: 'Invalid gmail send data' },
		),
		config: z.object(
			{
				auth_type: z.enum(['google_signin', 'google_manual'], { message: 'Invalid auth type' }),
				access_token: z
					.string({ message: 'Invalid access token' })
					.min(1, { message: 'Access token is required' }),
				to_from_config: z.string({ message: 'Invalid to from config' }).optional(),
				cc_from_config: z.string({ message: 'Invalid cc from config' }).optional(),
				bcc_from_config: z.string({ message: 'Invalid bcc from config' }).optional(),
				subject_from_config: z.string({ message: 'Invalid subject from config' }).optional(),
				body_from_config: z.string({ message: 'Invalid body from config' }).optional(),
			},
			{ message: 'Invalid gmail send config' },
		),
	})
	.refine((props) => props.data.to_email_addresses !== undefined || props.config.to_from_config !== undefined, {
		message: 'Recipient email address is required',
	})
	.refine((props) => props.data.subject_of_email !== undefined || props.config.subject_from_config !== undefined, {
		message: 'Subject of email is required',
	})
	.refine((props) => props.data.body_of_email !== undefined || props.config.body_from_config !== undefined, {
		message: 'Body of email is required',
	});

export type GmailSendDataType = z.infer<typeof gmailSendValidationSchema>['data'] & { defaultData: unknown };
export type GmailSendConfigType = z.infer<typeof gmailSendValidationSchema>['config'];

export const gmailSendValidate = async ({
	format,
	data,
	config,
}: GeneralNodePropsType<GmailSendDataType, GmailSendConfigType>): Promise<
	DefaultReturnType<GeneralNodeValidateReturnType<GmailSendDataType, GmailSendConfigType>>
> => {
	const validationResult = validate({ data: { format, data, config }, schema: gmailSendValidationSchema });
	if (isError(validationResult)) {
		return {
			...validationResult,
			trace: [...validationResult.trace, 'gmailSendValidate - validate'],
		};
	}

	return {
		format: validationResult.format,
		data: { ...validationResult.data, defaultData: validationResult.data.defaultData },
		config: validationResult.config,
	};
};
