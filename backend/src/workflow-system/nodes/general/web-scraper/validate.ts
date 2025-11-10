import { z } from 'zod';

import { validate } from 'src/shared/utils/zod.util';
import {
	GeneralNodePropsType,
	GeneralNodeValidateReturnType,
	responderDataFormats,
} from 'src/workflow-system/workflow-system.type';
import { DefaultReturnType } from 'src/shared/types/return.type';
import { isError } from 'src/shared/utils/error.util';

const webScraperValidationSchema = z.object({
	format: z.enum(responderDataFormats, { message: 'Invalid format' }),
	data: z.object({ defaultData: z.unknown({ message: 'Invalid content' }) }, { message: 'Invalid web scraper data' }),
	config: z.object(
		{
			url: z
				.string({ message: 'Invalid URL' })
				.url({ message: 'Invalid URL format' })
				.min(1, { message: 'URL is required' }),
		},
		{ message: 'Invalid web scraper config' },
	),
});

export type WebScraperDataType = z.infer<typeof webScraperValidationSchema>['data'] & { defaultData: unknown };
export type WebScraperConfigType = z.infer<typeof webScraperValidationSchema>['config'];

export const webScraperValidate = async ({
	format,
	data,
	config,
}: GeneralNodePropsType<WebScraperDataType, WebScraperConfigType>): Promise<
	DefaultReturnType<GeneralNodeValidateReturnType<WebScraperDataType, WebScraperConfigType>>
> => {
	const validationResult = validate({ data: { format, data, config }, schema: webScraperValidationSchema });
	if (isError(validationResult)) {
		return {
			...validationResult,
			trace: [...validationResult.trace, 'webScraperValidate - webScraperValidationSchema'],
		} as DefaultReturnType<GeneralNodeValidateReturnType<WebScraperDataType, WebScraperConfigType>>;
	}

	return {
		format: validationResult.format,
		data: { ...validationResult.data, defaultData: validationResult.data.defaultData },
		config: validationResult.config,
	};
};
