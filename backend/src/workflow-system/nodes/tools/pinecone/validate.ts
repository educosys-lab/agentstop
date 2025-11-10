import { z } from 'zod';

import { validate } from 'src/shared/utils/zod.util';
import { ToolNodeValidatePropsType } from 'src/workflow-system/workflow-system.type';
import { DefaultReturnType } from 'src/shared/types/return.type';
import { isError } from 'src/shared/utils/error.util';

const validationSchema = z.object({
	config: z.object(
		{
			PINECONE_API_KEY: z
				.string({ message: 'Invalid API key' })
				.min(1, { message: 'Pinecone API key is required' }),
		},
		{ message: 'Invalid pinecone tool config' },
	),
});

export const pineconeToolValidate = async ({ config }: ToolNodeValidatePropsType): Promise<DefaultReturnType<true>> => {
	const validationResult = validate({ data: { config }, schema: validationSchema });
	if (isError(validationResult)) {
		return { ...validationResult, trace: ['pineconeToolValidate - validate'] };
	}

	return true;
};
