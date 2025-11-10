import { DefaultReturnType } from '../types/return.type';
import { parseJson } from './json.util';
import { returnErrorString } from './return.util';
import { isError } from './error.util';

export const extractJsonFromAiResponse = (input: string): DefaultReturnType<Record<string, any>> => {
	try {
		const jsonMatch = input.match(/{[\s\S]*}/);
		if (!jsonMatch) {
			return {
				userMessage: 'Invalid data format!',
				error: 'No JSON found in data!',
				errorType: 'BadRequestException',
				errorData: { input },
				trace: ['extractJsonFromAiResponse - if (!jsonMatch)'],
			};
		}

		const parsedData = parseJson<Record<string, any>>(jsonMatch[0]);
		if (isError(parsedData)) return parsedData;

		return parsedData;
	} catch (error) {
		return {
			userMessage: 'Internal server error!',
			error: 'No valid JSON in data!',
			errorType: 'InternalServerErrorException',
			errorData: {
				input,
				error: returnErrorString(error),
			},
			trace: ['extractJsonFromAiResponse - catch'],
		};
	}
};

export const formatLLMResponseToText = (value: string): DefaultReturnType<string> => {
	try {
		const date = value
			.replace(/\*\*(.*?)\*\*/g, '$1') // remove bold markers
			.replace(/#+\s?(.*?)\n/g, '$1\n') // remove markdown headings
			.replace(/\\n/g, '\n') // convert literal \n to real line breaks
			.replace(/\n{3,}/g, '\n\n'); // clean up excessive newlines

		return date;
	} catch (error) {
		return {
			userMessage: 'Error formatting Agent response!',
			error: 'Error formatting Agent response to text!',
			errorType: 'InternalServerErrorException',
			errorData: {
				value,
				error: returnErrorString(error),
			},
			trace: ['formatLLMResponseToText - catch'],
		};
	}
};
