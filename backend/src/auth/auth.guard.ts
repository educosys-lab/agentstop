import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';

/**
 * @summary Auth guard
 * @description Guard to check if the user is authenticated
 * @functions
 * - canActivate
 */
@Injectable()
export class AuthGuard implements CanActivate {
	constructor(
		private jwtService: JwtService,
		private reflector: Reflector,
	) {}

	async canActivate(context: ExecutionContext) {
		const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
			context.getHandler(),
			context.getClass(),
		]);

		if (isPublic) return true;

		const request = context.switchToHttp().getRequest();

		const token = request.cookies?.authToken;
		if (!token) throw new UnauthorizedException('Missing auth token!');

		try {
			const payload = await this.jwtService.verifyAsync(token);
			if (!payload?.id) throw new UnauthorizedException('Invalid auth token!');

			return true;
		} catch {
			throw new UnauthorizedException('Error verifying auth token!');
		}
	}
}
