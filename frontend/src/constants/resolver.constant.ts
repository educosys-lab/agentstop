import { z, ZodSchema } from 'zod';

import { REGEX } from './regex.constant';

const trimValue = (value: string | number | boolean) => {
	return value && value.toString().trim().length > 0 ? value : undefined;
};

const convertToNumber = (value: string | number) => {
	return Number.isFinite(Number(value)) && !Number.isNaN(Number(value)) ? Number(value) : undefined;
};

const processInput = ({ type = 'string', schema }: { type?: 'string' | 'number'; schema: ZodSchema }) => {
	if (type === 'string') {
		return z.preprocess((value) => (trimValue(value as any) ? value : undefined), schema);
	} else {
		return z.preprocess(
			(value) => (trimValue(value as any) && convertToNumber(value as any) ? Number(value) : undefined),
			schema,
		);
	}
};

export const RESOLVER = ({
	type = 'string',
	field,
	minLength,
	maxLength,
	enumValue,
	isOnlyLetters,
	isOnlyPositive = false,
	isOptional,
}: {
	type?: 'email' | 'string' | 'number' | 'boolean' | 'date' | 'stringArray';
	field: string;
	minLength?: number;
	maxLength?: number;
	enumValue?: Record<string, string>;
	isOnlyLetters?: boolean;
	isOnlyPositive?: boolean;
	isOptional?: boolean;
}) => {
	if (type === 'email') {
		const validation = z
			.string({ required_error: `${field} is required` })
			.email(`Please enter a valid ${field}`)
			.regex(REGEX.EMAIL, `Please enter a valid ${field}`);
		return isOptional ? processInput({ schema: validation.optional() }) : processInput({ schema: validation });
	}

	if (type === 'string' && !enumValue) {
		let validation = z.string({ required_error: `${field} is required` });
		if (minLength) validation = validation.min(minLength, `${field} must have ${minLength} characters`);
		if (maxLength) validation = validation.max(maxLength, `${field} can't exceed ${maxLength} characters`);
		if (isOnlyLetters) validation = validation.regex(REGEX.ONLY_LETTERS, `${field} should contain only alphabets`);
		return isOptional ? processInput({ schema: validation.optional() }) : processInput({ schema: validation });
	}

	if (type === 'number') {
		let validation = z.number({ required_error: `${field} is required` });
		if (isOnlyPositive) validation = validation.positive(`${field} can't be negative`);
		return isOptional
			? processInput({ type: 'number', schema: validation.optional() })
			: processInput({ type: 'number', schema: validation });
	}

	if (type === 'boolean') {
		const validation = z.boolean({
			required_error: `${field} is required`,
			invalid_type_error: `${field} must be a boolean`,
		});
		return isOptional ? processInput({ schema: validation.optional() }) : processInput({ schema: validation });
	}

	if (type === 'date') {
		const validation = z.preprocess(
			(value) => {
				if (typeof value === 'string' || typeof value === 'number') {
					const date = new Date(value);
					return isNaN(date.getTime()) ? undefined : date;
				}
				return value;
			},
			z.date({
				required_error: `${field} is required`,
				invalid_type_error: `${field} must be a date`,
			}),
		);

		return isOptional ? processInput({ schema: validation.optional() }) : processInput({ schema: validation });
	}

	if (type === 'stringArray') {
		let validation = z.string().array();
		if (minLength) validation = validation.min(minLength, `${field} must have ${minLength} items`);
		if (maxLength) validation = validation.max(maxLength, `${field} can't exceed ${maxLength} items`);
		return isOptional ? processInput({ schema: validation.optional() }) : processInput({ schema: validation });
	}

	if (enumValue) {
		const validation = z.nativeEnum(enumValue, {
			required_error: `${field} is required`,
			invalid_type_error: `Please enter a valid ${field}`,
		});
		return isOptional ? processInput({ schema: validation.optional() }) : processInput({ schema: validation });
	}

	return z.string().optional();
};
