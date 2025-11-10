import { ErrorType } from './error.type';

export type DefaultReturnType<T> = T | ErrorResponseType;

export type ErrorResponseType = {
	userMessage: string;
	error: string;
	errorType: ErrorType;
	errorData: Record<string, any>;
	trace: string[];
};
