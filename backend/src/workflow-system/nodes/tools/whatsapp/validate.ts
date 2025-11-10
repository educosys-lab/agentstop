import { z } from 'zod';

import { validate } from 'src/shared/utils/zod.util';
import { ToolNodeValidatePropsType } from 'src/workflow-system/workflow-system.type';
import { DefaultReturnType } from 'src/shared/types/return.type';
import { isError } from 'src/shared/utils/error.util';

const whatsappToolValidationSchema = z.object({
	config: z.object(
		{
			WHATSAPP_ACCESS_TOKEN: z
				.string({ message: 'Invalid access token' })
				.min(1, { message: 'WhatsApp access token is required' }),
			PHONE_NUMBER_ID: z
				.string({ message: 'Invalid phone number ID' })
				.min(1, { message: 'Phone number ID is required' })
				.regex(/^[0-9]+$/, { message: 'Phone number ID must be a valid numeric ID (e.g., 754454767744368)' }),
			TEMPLATE_NAME: z.string({ message: 'Invalid template name' }).optional(),
		},
		{ message: 'Invalid WhatsApp tool config' },
	),
});

export const whatsappToolValidate = async ({ config }: ToolNodeValidatePropsType): Promise<DefaultReturnType<true>> => {
	const validationResult = validate({ data: { config }, schema: whatsappToolValidationSchema });
	if (isError(validationResult)) {
		return {
			...validationResult,
			trace: [...validationResult.trace, 'whatsappToolValidate - validate'],
		};
	}

	return true;
};
