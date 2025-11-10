import { z } from 'zod';

import { validate } from 'src/shared/utils/zod.util';
import { ToolNodeValidatePropsType } from 'src/workflow-system/workflow-system.type';
import { DefaultReturnType } from 'src/shared/types/return.type';
import { isError } from 'src/shared/utils/error.util';

const gitHubToolValidationSchema = z.object({
	config: z.object(
		{
			GITHUB_PERSONAL_ACCESS_TOKEN: z
				.string({ message: 'Invalid personal access token' })
				.min(1, { message: 'Personal access token is required' }),
		},
		{ message: 'Invalid github tool config' },
	),
});

export const gitHubToolValidate = async ({ config }: ToolNodeValidatePropsType): Promise<DefaultReturnType<true>> => {
	const validationResult = validate({ data: { config }, schema: gitHubToolValidationSchema });
	if (isError(validationResult)) {
		return { ...validationResult, trace: ['gitHubToolValidate - validate'] };
	}

	return true;
};
