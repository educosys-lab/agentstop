import { AES, enc } from 'crypto-js';

import { DefaultReturnType } from '../types/return.type';
import { returnErrorString } from './return.util';

export const simpleEncryptString = (props: { key?: string; value: string }): DefaultReturnType<string> => {
	try {
		const { key, value } = props;
		const ENCRYPTION_KEY = key || process.env.ENCRYPTION_KEY;
		if (!ENCRYPTION_KEY) {
			return {
				userMessage: 'Internal server error!',
				error: 'Encryption key not found!',
				errorType: 'InternalServerErrorException',
				errorData: { props },
				trace: ['simpleEncryptString - if (!ENCRYPTION_KEY)'],
			};
		}

		const encryptedValue = AES.encrypt(value, key || ENCRYPTION_KEY).toString();
		return encryptedValue;
	} catch (error) {
		return {
			userMessage: 'Internal server error!',
			error: 'Error encrypting string!',
			errorType: 'InternalServerErrorException',
			errorData: {
				props,
				error: returnErrorString(error),
			},
			trace: ['simpleEncryptString - catch'],
		};
	}
};

export const simpleDecryptString = (props: { key?: string; value: string }): DefaultReturnType<string> => {
	try {
		const { key, value } = props;

		const ENCRYPTION_KEY = key || process.env.ENCRYPTION_KEY;
		if (!ENCRYPTION_KEY) {
			return {
				userMessage: 'Internal server error!',
				error: 'Encryption key not found!',
				errorType: 'InternalServerErrorException',
				errorData: { props },
				trace: ['simpleDecryptString - if (!ENCRYPTION_KEY)'],
			};
		}

		const decryptedValue = AES.decrypt(value, key || ENCRYPTION_KEY).toString(enc.Utf8);
		return decryptedValue;
	} catch (error) {
		return {
			userMessage: 'Internal server error!',
			error: 'Error decrypting string',
			errorType: 'InternalServerErrorException',
			errorData: {
				props,
				error: returnErrorString(error),
			},
			trace: ['simpleDecryptString - catch'],
		};
	}
};
