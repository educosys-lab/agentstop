import { z } from 'zod';

import { validate } from 'src/shared/utils/zod.util';
import { ToolNodeValidatePropsType } from 'src/workflow-system/workflow-system.type';
import { DefaultReturnType } from 'src/shared/types/return.type';
import { isError } from 'src/shared/utils/error.util';

const tavilyToolValidationSchema = z.object({
	config: z.object(
		{
			TAVILY_API_KEY: z.string({ message: 'Invalid API key' }).min(1, { message: 'API key is required' }),
		},
		{ message: 'Invalid tavily tool config' },
	),
});

export const tavilyToolValidate = async ({ config }: ToolNodeValidatePropsType): Promise<DefaultReturnType<true>> => {
	const validationResult = validate({ data: { config }, schema: tavilyToolValidationSchema });
	if (isError(validationResult)) {
		return { ...validationResult, trace: ['tavilyToolValidate - validate'] };
	}

	return true;
};
