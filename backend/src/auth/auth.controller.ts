import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';

import { AuthService } from './auth.service';
import { UserService } from 'src/user/user.service';
import { CreateUserType, PublicUserType, SigninUserType, UserType } from 'src/user/user.type';
import { Public } from './public.decorator';
import { log } from 'src/shared/logger/logger';
import { getPublicUserData } from 'src/user/user.util';
import { isError, throwError } from 'src/shared/utils/error.util';
import { TIME } from 'src/shared/constants/time.constant';

/**
 * @summary Auth controller
 * @description Controller for auth operations
 * @routes
 * - /auth/signin - POST - Public
 * - /auth/signup - POST - Public
 * - /auth/refresh - GET - Public
 * - /auth/logout - GET - Public
 */
@Controller('/auth')
export class AuthController {
	constructor(
		private readonly authService: AuthService,
		private readonly userService: UserService,
	) {}

	/**
	 * Sign in user
	 */
	@Public()
	@Post('/signin')
	async signin(@Body() props: SigninUserType, @Res({ passthrough: true }) res: Response): Promise<PublicUserType> {
		let user: UserType | undefined;

		if (props.type === 'cred') {
			const signinUserResponse = await this.userService.signinUser(props);
			if (isError(signinUserResponse)) {
				if (signinUserResponse.errorType !== 'NotFoundException') {
					log('auth', 'error', {
						message: signinUserResponse.error,
						data: signinUserResponse.errorData,
						trace: [...signinUserResponse.trace, 'AuthController - signin - this.userService.signinUser'],
					});
				}
				throwError({ error: signinUserResponse.userMessage, errorType: signinUserResponse.errorType });
			}

			user = signinUserResponse;
		}

		if (!user) throwError({ error: 'User not found!', errorType: 'NotFoundException' });

		const tokenData = await this.authService.userAuth({ id: user.id, email: user.email, username: user.username });
		if (isError(tokenData)) {
			log(user.id, 'error', {
				message: tokenData.error,
				data: tokenData.errorData,
				trace: [...tokenData.trace, 'AuthController - signin - this.authService.userAuth'],
			});
			throwError({ error: tokenData.userMessage, errorType: tokenData.errorType });
		}

		const { authToken, refreshToken } = tokenData;

		res.cookie('authToken', authToken, {
			httpOnly: true,
			secure: true,
			sameSite: 'strict',
			path: '/',
			maxAge: 1 * TIME.DAY_IN_MS,
		});

		res.cookie('refreshToken', refreshToken, {
			httpOnly: true,
			secure: true,
			sameSite: 'strict',
			path: '/',
			maxAge: 30 * TIME.DAY_IN_MS,
		});

		const publicUserData = getPublicUserData(user);
		if (isError(publicUserData)) {
			log(user.id, 'error', {
				message: publicUserData.error,
				data: publicUserData.errorData,
				trace: [...publicUserData.trace, 'AuthController - signin - getPublicUserData'],
			});
			throwError({ error: publicUserData.userMessage, errorType: publicUserData.errorType });
		}

		return publicUserData;
	}

	/**
	 * Sign up user
	 */
	@Public()
	@Post('/signup')
	async signup(@Body() props: CreateUserType, @Res({ passthrough: true }) res: Response): Promise<PublicUserType> {
		const user = await this.userService.createUser(props);
		if (isError(user)) {
			log('auth', 'error', {
				message: user.error,
				data: user.errorData,
				trace: [...user.trace, 'AuthController - signup - this.userService.createUser'],
			});
			throwError({ error: user.userMessage, errorType: user.errorType });
		}

		const tokenData = await this.authService.userAuth({
			id: user.id,
			email: user.email,
			username: user.username,
		});
		if (isError(tokenData)) {
			log('auth', 'error', {
				message: tokenData.error,
				data: tokenData.errorData,
				trace: [...tokenData.trace, 'AuthController - signup - this.authService.userAuth'],
			});
			throwError({ error: tokenData.userMessage, errorType: tokenData.errorType });
		}

		const { authToken, refreshToken } = tokenData;

		res.cookie('authToken', authToken, {
			httpOnly: true,
			secure: true,
			sameSite: 'strict',
			path: '/',
			maxAge: 1 * TIME.DAY_IN_MS,
		});

		res.cookie('refreshToken', refreshToken, {
			httpOnly: true,
			secure: true,
			sameSite: 'strict',
			path: '/',
			maxAge: 30 * TIME.DAY_IN_MS,
		});

		const publicUserData = getPublicUserData(user);
		if (isError(publicUserData)) {
			log(user.id, 'error', {
				message: publicUserData.error,
				data: publicUserData.errorData,
				trace: [...publicUserData.trace, 'AuthController - signup - getPublicUserData'],
			});
			throwError({ error: publicUserData.userMessage, errorType: publicUserData.errorType });
		}

		return publicUserData;
	}

	/**
	 * Refresh user token
	 */
	@Public()
	@Get('/refresh')
	async refresh(@Req() req: Request, @Res() res: Response): Promise<Response<any, Record<string, any>>> {
		const oldRefreshToken = req.cookies?.refreshToken;
		if (!oldRefreshToken) throwError({ error: 'No refresh token!', errorType: 'UnauthorizedException' });

		const tokenData = await this.authService.userRefresh(oldRefreshToken);
		if (isError(tokenData)) {
			log('auth', 'error', {
				message: tokenData.error,
				data: tokenData.errorData,
				trace: [...tokenData.trace, 'AuthController - refresh - this.authService.userRefresh'],
			});
			throwError({ error: tokenData.userMessage, errorType: tokenData.errorType });
		}

		const { authToken, refreshToken } = tokenData;

		res.cookie('authToken', authToken, {
			httpOnly: true,
			secure: true,
			sameSite: 'strict',
			path: '/',
			maxAge: 1 * TIME.DAY_IN_MS,
		});

		if (refreshToken) {
			res.cookie('refreshToken', refreshToken, {
				httpOnly: true,
				secure: true,
				sameSite: 'strict',
				path: '/',
				maxAge: 30 * TIME.DAY_IN_MS,
			});
		}

		return res.send();
	}

	/**
	 * Logout user
	 */
	@Public()
	@Get('/logout')
	logout(@Res() res: Response): Response<any, Record<string, any>> {
		res.clearCookie('authToken', { httpOnly: true, secure: true, sameSite: 'strict' });
		res.clearCookie('refreshToken', { httpOnly: true, secure: true, sameSite: 'strict' });

		return res.send();
	}
}
