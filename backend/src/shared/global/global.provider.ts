import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

import { DefaultReturnType } from '../types/return.type';
import { returnErrorString } from '../utils/return.util';

/**
 * @summary Global provider
 * @description Provider for global operations
 * @functions
 * - getAiClient
 */
@Injectable()
export class GlobalProvider {
	private readonly openai: OpenAI | string;

	constructor(private configService: ConfigService) {
		const apiKey = this.configService.get<string>('OPENAI_API_KEY');
		if (!apiKey) this.openai = 'Open AI key is missing!';
		else this.openai = new OpenAI({ apiKey });
	}

	/**
	 * Get OpenAI client
	 */
	getAiClient(): DefaultReturnType<OpenAI> {
		try {
			if (typeof this.openai === 'string') {
				return {
					userMessage: this.openai,
					error: this.openai,
					errorType: 'BadRequestException',
					errorData: {},
					trace: ['GlobalProvider - getAiClient - if (this.error)'],
				};
			}

			return this.openai;
		} catch (error) {
			return {
				userMessage: 'Internal server error!',
				error: 'Error getting OpenAI client!',
				errorType: 'InternalServerErrorException',
				errorData: {
					error: returnErrorString(error),
				},
				trace: ['GlobalProvider - getAiClient - catch'],
			};
		}
	}
}
