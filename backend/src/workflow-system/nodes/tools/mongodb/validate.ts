import { z } from 'zod';

import { validate } from 'src/shared/utils/zod.util';
import { ToolNodeValidatePropsType } from 'src/workflow-system/workflow-system.type';
import { DefaultReturnType } from 'src/shared/types/return.type';
import { isError } from 'src/shared/utils/error.util';

const validationSchema = z.object({
	config: z.object(
		{
			MDB_MCP_CONNECTION_STRING: z
				.string({ message: 'Invalid connection string' })
				.min(1, { message: 'MongoDB connection string is required' }),
		},
		{ message: 'Invalid mongodb tool config' },
	),
});

export const mongodbToolValidate = async ({ config }: ToolNodeValidatePropsType): Promise<DefaultReturnType<true>> => {
	const validationResult = validate({ data: { config }, schema: validationSchema });
	if (isError(validationResult)) {
		return { ...validationResult, trace: ['mongodbToolValidate - validate'] };
	}

	return true;
};
