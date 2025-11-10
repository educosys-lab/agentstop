import { z } from 'zod';

import { validate } from 'src/shared/utils/zod.util';
import { ToolNodeValidatePropsType } from 'src/workflow-system/workflow-system.type';
import { DefaultReturnType } from 'src/shared/types/return.type';
import { isError } from 'src/shared/utils/error.util';

const validationSchema = z.object({
	config: z.object(
		{
			FIRECRAWL_API_KEY: z
				.string({ message: 'Invalid API key' })
				.min(1, { message: 'Firecrawl API key is required' }),
		},
		{ message: 'Invalid firecrawl tool config' },
	),
});

export const firecrawlToolValidate = async ({
	config,
}: ToolNodeValidatePropsType): Promise<DefaultReturnType<true>> => {
	const validationResult = validate({ data: { config }, schema: validationSchema });
	if (isError(validationResult)) {
		return { ...validationResult, trace: ['firecrawlToolValidate - validate'] };
	}

	return true;
};
