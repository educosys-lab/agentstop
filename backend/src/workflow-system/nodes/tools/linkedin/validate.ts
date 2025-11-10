import { z } from 'zod';
import { validate } from 'src/shared/utils/zod.util';
import { ToolNodeValidatePropsType } from 'src/workflow-system/workflow-system.type';
import { DefaultReturnType } from 'src/shared/types/return.type';
import { isError } from 'src/shared/utils/error.util';

const linkedinToolValidationSchema = z.object({
	config: z.object(
		{
			APIFY_API_TOKEN: z
				.string({ message: 'Invalid Apify API token' })
				.min(1, { message: 'Apify API token is required' }),
		},
		{ message: 'Invalid LinkedIn tool config' },
	),
});

export const linkedinToolValidate = async ({ config }: ToolNodeValidatePropsType): Promise<DefaultReturnType<true>> => {
	const validationResult = validate({ data: { config }, schema: linkedinToolValidationSchema });
	if (isError(validationResult)) {
		return {
			...validationResult,
			trace: [...validationResult.trace, 'linkedinToolValidate - validate'],
		};
	}

	return true;
};
