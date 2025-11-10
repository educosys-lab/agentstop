import { DefaultReturnType } from '../types/return.type';
import { returnErrorString } from './return.util';

export const parseJson = <T>(value: any): DefaultReturnType<T> => {
	try {
		const data = JSON.parse(value) as T;
		return data;
	} catch (error) {
		return {
			userMessage: 'Invalid data format!',
			error: 'Invalid JSON format!',
			errorType: 'BadRequestException',
			errorData: {
				value,
				error: returnErrorString(error),
			},
			trace: ['parseJson - catch'],
		};
	}
};
