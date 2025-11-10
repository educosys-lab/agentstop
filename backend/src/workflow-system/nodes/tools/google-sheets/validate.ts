import { z } from 'zod';

import { validate } from 'src/shared/utils/zod.util';
import { ToolNodeValidatePropsType } from 'src/workflow-system/workflow-system.type';
import { DefaultReturnType } from 'src/shared/types/return.type';
import { isError } from 'src/shared/utils/error.util';

const validationSchema = z.object({
	config: z
		.object(
			{
				auth_type: z.enum(['google_signin', 'google_manual'], {
					errorMap: () => ({
						message: 'Authentication type must be either "google_signin" or "google_manual"',
					}),
				}),
				placeholder: z
					.object({
						access_token: z.string({ message: 'Invalid access token' }).optional(),
						refresh_token: z.string({ message: 'Invalid refresh token' }).optional(),
						file_id: z.string({ message: 'Invalid file ID' }).optional(),
					})
					.optional(),
				access_token: z.string({ message: 'Invalid access token' }).optional(),
				refresh_token: z.string({ message: 'Invalid refresh token' }).optional(),
				file_id: z.string({ message: 'Invalid file ID' }).optional(),
			},
			{ message: 'Invalid google sheets tool config' },
		)
		.refine(
			(data) => {
				if (data.auth_type === 'google_signin') return true;
				if (data.auth_type === 'google_manual') {
					return !!data.access_token && !!data.refresh_token && !!data.file_id;
				}
				return false;
			},
			{
				message: 'Required fields are missing based on authentication type',
				path: ['auth_type'],
			},
		),
});

export const googleSheetsToolValidate = async ({
	config,
}: ToolNodeValidatePropsType): Promise<DefaultReturnType<true>> => {
	const validationResult = validate({ data: { config }, schema: validationSchema });
	if (isError(validationResult)) {
		return { ...validationResult, trace: ['googleSheetsToolValidate - validate'] };
	}

	return true;
};
