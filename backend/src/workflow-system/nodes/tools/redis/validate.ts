import { z } from 'zod';

import { validate } from 'src/shared/utils/zod.util';
import { ToolNodeValidatePropsType } from 'src/workflow-system/workflow-system.type';
import { DefaultReturnType } from 'src/shared/types/return.type';
import { isError } from 'src/shared/utils/error.util';

const redisToolValidationSchema = z.object({
	config: z.object(
		{
			REDIS_HOST: z.string({ message: 'Invalid host' }).min(1, { message: 'Redis host is required' }),
			REDIS_PORT: z.string({ message: 'Invalid port' }).min(1, { message: 'Redis port is required' }),
			REDIS_PWD: z.string({ message: 'Invalid password' }).optional(),
			REDIS_SSL: z.enum(['True', 'False'], { errorMap: () => ({ message: 'Redis SSL must be True or False' }) }),
			REDIS_CA_PATH: z.string({ message: 'Invalid CA path' }).optional(),
			REDIS_CLUSTER_MODE: z.enum(['True', 'False'], {
				errorMap: () => ({ message: 'Redis cluster mode must be True or False' }),
			}),
		},
		{ message: 'Invalid redis tool config' },
	),
});

export const redisToolValidate = async ({ config }: ToolNodeValidatePropsType): Promise<DefaultReturnType<true>> => {
	const validationResult = validate({ data: { config }, schema: redisToolValidationSchema });
	if (isError(validationResult)) {
		return { ...validationResult, trace: ['redisToolValidate - validate'] };
	}

	return true;
};
