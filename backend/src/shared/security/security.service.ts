import { Injectable } from '@nestjs/common';
import { AES, enc } from 'crypto-js';

import { DefaultReturnType } from '../types/return.type';
import { returnErrorString } from '../utils/return.util';
import { isError } from '../utils/error.util';

/**
 * @summary Security service
 * @description Service for security operations
 * @functions
 * - encryptString
 * - decryptString
 *
 * @private
 * - getDecryptionKey
 */
@Injectable()
export class SecurityService {
	constructor() {}

	/**
	 * Encrypt string
	 */
	async encryptString(props: { key?: string; value: string }): Promise<DefaultReturnType<string>> {
		try {
			const { key, value } = props;
			const decryptionKey = key || (await this.getDecryptionKey());

			if (isError(decryptionKey)) {
				return {
					...decryptionKey,
					trace: [
						...decryptionKey.trace,
						'SecurityService - encryptString - key || (await this.getDecryptionKey())',
					],
				};
			}

			const encryptedValue = AES.encrypt(value, decryptionKey).toString();
			return encryptedValue;
		} catch (error) {
			return {
				userMessage: 'Internal server error!',
				error: 'Unable to encrypt the value!',
				errorType: 'InternalServerErrorException',
				errorData: {
					props,
					error: returnErrorString(error),
				},
				trace: ['SecurityService - encryptString - catch'],
			};
		}
	}

	/**
	 * Decrypt string
	 */
	async decryptString(props: { key?: string; value: string }): Promise<DefaultReturnType<string>> {
		try {
			const { key, value } = props;

			const decryptionKey = key || (await this.getDecryptionKey());
			if (isError(decryptionKey)) {
				return {
					...decryptionKey,
					trace: [
						...decryptionKey.trace,
						'SecurityService - decryptString - key || (await this.getDecryptionKey())',
					],
				};
			}

			const decryptedValue = AES.decrypt(value, decryptionKey).toString(enc.Utf8);
			return decryptedValue;
		} catch (error) {
			return {
				userMessage: 'Internal server error!',
				error: 'Unable to decrypt the value!',
				errorType: 'InternalServerErrorException',
				errorData: {
					props,
					error: returnErrorString(error),
				},
				trace: ['SecurityService - decryptString - catch'],
			};
		}
	}

	/**
	 * Get decryption key
	 */
	private async getDecryptionKey(): Promise<DefaultReturnType<string>> {
		try {
			const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
			if (!ENCRYPTION_KEY) {
				return {
					userMessage: 'Internal server error!',
					error: 'Encryption key not found!',
					errorType: 'InternalServerErrorException',
					errorData: { ENCRYPTION_KEY },
					trace: ['SecurityService - getDecryptionKey - if (!ENCRYPTION_KEY)'],
				};
			}

			return ENCRYPTION_KEY;
		} catch (error) {
			return {
				userMessage: 'Internal server error!',
				error: 'Error in getting decryption key',
				errorType: 'InternalServerErrorException',
				errorData: {
					error: returnErrorString(error),
				},
				trace: ['SecurityService - getDecryptionKey - catch'],
			};
		}
	}
}
