import { z } from 'zod';

import { validate } from 'src/shared/utils/zod.util';
import { ToolNodeValidatePropsType } from 'src/workflow-system/workflow-system.type';
import { isObject } from 'src/shared/utils/object.util';
import { DefaultReturnType } from 'src/shared/types/return.type';
import { isError } from 'src/shared/utils/error.util';

const validationSchema = z.object({
	config: z.object(
		{
			OPENAPI_MCP_HEADERS: z
				.string({ message: 'Invalid headers' })
				.min(1, { message: 'Notion API headers are required' })
				.refine(
					(value) => {
						try {
							const parsed = JSON.parse(value);
							return (
								isObject(parsed) &&
								'Authorization' in parsed &&
								parsed.Authorization.startsWith('Bearer ntn_') &&
								'Notion-Version' in parsed &&
								parsed['Notion-Version'] === '2022-06-28'
							);
						} catch {
							return false;
						}
					},
					{
						message:
							'Notion API Headers must be a valid JSON object with a valid Bearer token (starting with "ntn_") and Notion-Version set to "2022-06-28"',
					},
				),
		},
		{ message: 'Invalid notion tool config' },
	),
});

export const notionToolValidate = async ({ config }: ToolNodeValidatePropsType): Promise<DefaultReturnType<true>> => {
	const validationResult = validate({ data: { config }, schema: validationSchema });
	if (isError(validationResult)) {
		return { ...validationResult, trace: ['notionToolValidate - validate'] };
	}

	return true;
};
