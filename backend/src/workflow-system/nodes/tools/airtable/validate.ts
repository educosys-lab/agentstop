import { z } from 'zod';

import { validate } from 'src/shared/utils/zod.util';
import { ToolNodeValidatePropsType } from 'src/workflow-system/workflow-system.type';
import { DefaultReturnType } from 'src/shared/types/return.type';
import { isError } from 'src/shared/utils/error.util';

const airtableToolValidationSchema = z.object({
	config: z.object(
		{
			AIRTABLE_API_KEY: z.string({ message: 'Invalid API key' }).min(1, { message: 'API key is required' }),
		},
		{ message: 'Invalid airtable tool config' },
	),
});

export const airtableToolValidate = async ({ config }: ToolNodeValidatePropsType): Promise<DefaultReturnType<true>> => {
	const validationResult = validate({ data: { config }, schema: airtableToolValidationSchema });
	if (isError(validationResult)) {
		return { ...validationResult, trace: ['airtableToolValidate - validate'] };
	}

	return true;
};
