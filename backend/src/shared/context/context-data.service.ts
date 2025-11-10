import { Injectable } from '@nestjs/common';

import { RequestContextService } from './request-context.service';
import { DefaultReturnType } from '../types/return.type';
import { isError } from '../utils/error.util';

/**
 * @summary Context data service
 * @description Service for context data operations
 * @functions
 * - getUserIdFromContext
 */
@Injectable()
export class ContextDataService {
	constructor(private readonly requestContext: RequestContextService) {}

	/**
	 * Get user ID from context
	 */
	getUserIdFromContext(): DefaultReturnType<string | undefined> {
		const userId = this.requestContext.get<string | undefined>('userId');
		if (isError(userId)) {
			return {
				...userId,
				trace: [
					...userId.trace,
					'ContextDataService - getUserIdFromContext - this.requestContext.get<string | undefined>',
				],
			};
		}

		return userId;
	}
}
