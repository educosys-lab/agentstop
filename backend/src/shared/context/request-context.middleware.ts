import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

import { RequestContextService } from './request-context.service';
import { log } from '../logger/logger';
import { returnErrorString } from '../utils/return.util';

/**
 * @summary Request context middleware
 * @description Middleware for request context operations
 * @functions
 * - use
 */
@Injectable()
export class RequestContextMiddleware implements NestMiddleware {
	constructor(private readonly requestContext: RequestContextService) {}

	/**
	 * Use request context middleware
	 */
	use(req: Request, res: Response, next: NextFunction) {
		try {
			const userId = req && (req as any).userId ? (req as any).userId : undefined;

			this.requestContext.run(() => next(), {
				userId,
				// Add more request-level data
			});
		} catch (error) {
			log('system', 'error', {
				message: 'Error in RequestContextMiddleware',
				data: {
					req,
					error: returnErrorString(error),
				},
				trace: ['RequestContextMiddleware - use - catch'],
			});
			next();
		}
	}
}
