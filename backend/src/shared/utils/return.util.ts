import { isObject } from './object.util';

export const returnErrorString = (error: unknown): string => {
	if (typeof error === 'string') return error;

	if (isObject(error) && 'response' in error && typeof error.response === 'string') return error.response;

	if (isObject(error) && 'message' in error && typeof error.message === 'string') return error.message;

	return 'Unknown Error';
};
