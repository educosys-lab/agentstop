import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

import { info } from '../logger/logger';

/**
 * @summary Detect middleware
 * @description Middleware for detecting operations
 * @functions
 * - use
 */
@Injectable()
export class DetectMiddleware implements NestMiddleware {
	/**
	 * Use detect middleware
	 */
	use(req: Request, res: Response, next: NextFunction) {
		info('access', 'info', `[${req.method}] ${req.originalUrl}`);
		next();
	}
}
