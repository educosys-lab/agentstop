import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request, NextFunction } from 'express';

import { log } from 'src/shared/logger/logger';
import { returnErrorString } from 'src/shared/utils/return.util';

/**
 * @summary Auth user id middleware
 * @description Middleware to set the user id in the request object
 * @functions
 * - use
 */
@Injectable()
export class AuthUserIdMiddleware implements NestMiddleware {
	constructor(private jwtService: JwtService) {}

	async use(req: Request, res: Response, next: NextFunction) {
		const token = req.cookies?.authToken;
		if (!token) throw new UnauthorizedException('Missing user auth token!');

		try {
			const payload = await this.jwtService.verifyAsync(token);
			if (!payload || !payload.id) throw new UnauthorizedException('Invalid user auth token!');

			(req as any).userId = payload.id;
		} catch (error) {
			log('auth', 'error', {
				message: 'Error verifying token!',
				data: {
					token,
					error: returnErrorString(error),
				},
				trace: ['AuthUserIdMiddleware - use - catch'],
			});
			throw new UnauthorizedException('Error verifying user auth token!');
		}

		next();
	}
}
