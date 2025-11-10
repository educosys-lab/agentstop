import { z } from 'zod';

import { validate } from 'src/shared/utils/zod.util';
import { ToolNodeValidatePropsType } from 'src/workflow-system/workflow-system.type';
import { DefaultReturnType } from 'src/shared/types/return.type';
import { isError } from 'src/shared/utils/error.util';

const supabaseToolValidationSchema = z.object({
	config: z.object(
		{
			SUPABASE_ACCESS_TOKEN: z
				.string({ message: 'Invalid access token' })
				.min(1, { message: 'Access token is required' }),
		},
		{ message: 'Invalid supabase tool config' },
	),
});

export const supabaseToolValidate = async ({ config }: ToolNodeValidatePropsType): Promise<DefaultReturnType<true>> => {
	const validationResult = validate({ data: { config }, schema: supabaseToolValidationSchema });
	if (isError(validationResult)) {
		return { ...validationResult, trace: ['supabaseToolValidate - validate'] };
	}

	return true;
};
