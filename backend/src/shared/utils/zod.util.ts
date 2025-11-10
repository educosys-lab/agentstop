import { ZodError, ZodSchema } from 'zod';

import { DefaultReturnType } from '../types/return.type';
import { returnErrorString } from './return.util';
import { isError } from './error.util';

export const parseZodError = (
	errorValue: ZodError,
): DefaultReturnType<{ errorWithKey: string; errorString: string }> => {
	try {
		const errors = errorValue.errors.reduce(
			(acc, curr) => {
				const field = curr.path[0] as keyof typeof acc;

				if (acc[field]) acc[field] = `${acc[field]}, ${curr.message}`;
				else acc[field] = curr.message;
				return acc;
			},
			{} as Record<string, string>,
		);

		const errorWithKey = Object.entries(errors)
			.map(([key, value]) => `${key}: ${value}`)
			.join(', ');
		const errorString = Object.entries(errors)
			.map(([, value]) => `${value}`)
			.join(', ');

		return { errorWithKey, errorString };
	} catch (error) {
		return {
			userMessage: 'Validation error!',
			error: 'Validation error!',
			errorType: 'InternalServerErrorException',
			errorData: {
				errorValue,
				error: returnErrorString(error),
			},
			trace: ['parseZodError - catch'],
		};
	}
};

export const validate = <T>(props: { data: T; schema: ZodSchema }): DefaultReturnType<T> => {
	const { data, schema } = props;
	const { success, data: validData, error } = schema.safeParse(data);

	if (!success) {
		const errorData = parseZodError(error);
		if (isError(errorData)) {
			return {
				...errorData,
				trace: [...errorData.trace, 'validate - parseZodError'],
			};
		}

		return {
			userMessage: errorData.errorString,
			error: errorData.errorWithKey,
			errorType: 'BadRequestException',
			errorData: { error },
			trace: ['validate - parseZodError'],
		};
	}

	return validData;
};
