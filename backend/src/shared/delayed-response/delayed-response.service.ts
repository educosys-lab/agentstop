import { Injectable } from '@nestjs/common';
import { Response } from 'express';

import { DefaultReturnType } from 'src/shared/types/return.type';
import { returnErrorString } from 'src/shared/utils/return.util';
import { log } from 'src/shared/logger/logger';
import { TIME } from 'src/shared/constants/time.constant';

/**
 * @summary Delayed response service
 * @description Service for managing delayed HTTP responses
 * @functions
 * - storeResponse
 * - sendResponse
 * - clearResponse
 */
@Injectable()
export class DelayedResponseService {
	private readonly responseMap = new Map<string, Response>();

	/**
	 * Store a response object for later use
	 */
	storeResponse({ requestId, response }: { requestId: string; response: Response }): DefaultReturnType<true> {
		try {
			this.responseMap.set(requestId, response);

			/** Set a timeout to clean up the response after 5 minutes */
			setTimeout(() => this.clearResponse(requestId), 5 * TIME.MINUTE_IN_MS);
			return true;
		} catch (error) {
			return {
				userMessage: 'Internal server error!',
				error: 'Error storing response!',
				errorType: 'InternalServerErrorException',
				errorData: {
					requestId,
					error: returnErrorString(error),
				},
				trace: ['DelayedResponseService - storeResponse - catch'],
			};
		}
	}

	/**
	 * Send a response using the stored response object
	 */
	sendResponse({
		requestId,
		data,
		statusCode = 200,
	}: {
		requestId: string;
		data: any;
		statusCode: number;
	}): DefaultReturnType<boolean> {
		try {
			const response = this.responseMap.get(requestId);

			if (!response) {
				return {
					userMessage: 'Response not found!',
					error: 'Response object not found for the given request ID',
					errorType: 'NotFoundException',
					errorData: { requestId },
					trace: ['DelayedResponseService - sendResponse - response not found'],
				};
			}

			/** Check if response has already been sent */
			if (response.headersSent) {
				log('system', 'warn', {
					message: 'Attempted to send response that was already sent',
					data: { requestId },
					trace: ['DelayedResponseService - sendResponse - headers already sent'],
				});
				return false;
			}

			response.status(statusCode).json(data);
			this.clearResponse(requestId);

			return true;
		} catch (error) {
			return {
				userMessage: 'Internal server error!',
				error: 'Error sending response!',
				errorType: 'InternalServerErrorException',
				errorData: {
					requestId,
					error: returnErrorString(error),
				},
				trace: ['DelayedResponseService - sendResponse - catch'],
			};
		}
	}

	/**
	 * Clear a stored response
	 */
	clearResponse(requestId: string): boolean {
		try {
			return this.responseMap.delete(requestId);
		} catch (error) {
			log('system', 'error', {
				message: 'Error clearing response',
				data: { requestId, error: returnErrorString(error) },
				trace: ['DelayedResponseService - clearResponse - catch'],
			});
			return false;
		}
	}

	/**
	 * Check if a response exists for the given request ID
	 */
	hasResponse(requestId: string): boolean {
		return this.responseMap.has(requestId);
	}

	/**
	 * Get all active request IDs
	 */
	getActiveRequestIds(): string[] {
		return Array.from(this.responseMap.keys());
	}
}
