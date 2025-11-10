import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { AUTH } from 'src/auth/auth.constant';
import { VerifyTokenPayloadType, VerifyUserRefreshTokenReturnType } from './auth.type';
import { UserService } from 'src/user/user.service';
import { createUserRefreshToken, decryptUserRefreshToken } from 'src/user/user.util';
import { DefaultReturnType } from 'src/shared/types/return.type';
import { SecurityService } from 'src/shared/security/security.service';
import { returnErrorString } from 'src/shared/utils/return.util';
import { isError } from 'src/shared/utils/error.util';

/**
 * @summary Auth service
 * @description Service for auth operations
 * @functions
 * - userAuth
 * - userRefresh
 * - verifyToken
 *
 * @private
 * - getAuthToken
 * - verifyUserRefreshToken
 */
@Injectable()
export class AuthService {
	constructor(
		private readonly jwtService: JwtService,
		private readonly securityService: SecurityService,

		private readonly userService: UserService,
	) {}

	/**
	 * Generate auth token
	 */
	async userAuth(props: {
		id: string;
		email: string;
		username: string;
	}): Promise<DefaultReturnType<{ authToken: string; refreshToken: string }>> {
		try {
			const { id, email, username } = props;

			const authToken = await this.getAuthToken({ id, email, username });
			if (isError(authToken)) {
				return { ...authToken, trace: [...authToken.trace, 'AuthService - userAuth - this.getAuthToken'] };
			}

			const user = await this.userService.getUser({ id });
			if (isError(user)) {
				return {
					...user,
					trace: [...user.trace, 'AuthService - userAuth - this.userService.getUser'],
				};
			}

			return { authToken: authToken, refreshToken: user.refreshToken };
		} catch (error) {
			return {
				userMessage: 'Error generating auth token!',
				error: 'Error generating auth token!',
				errorType: 'InternalServerErrorException',
				errorData: {
					props,
					error: returnErrorString(error),
				},
				trace: ['AuthService - userAuth - catch'],
			};
		}
	}

	/**
	 * Refresh auth token
	 */
	async userRefresh(refreshToken: string): Promise<DefaultReturnType<{ authToken: string; refreshToken: string }>> {
		try {
			const isUserValid = await this.verifyUserRefreshToken(refreshToken);
			if (isError(isUserValid)) {
				return {
					...isUserValid,
					trace: [...isUserValid.trace, 'AuthService - userRefresh - this.verifyUserRefreshToken'],
				};
			}

			const { id, email, username, created } = isUserValid;
			const hasRefreshTokenExpired = Date.now() - created > AUTH.REFRESH_TOKEN_VALIDITY;

			const newAuthToken = await this.getAuthToken({ id, email, username });
			if (isError(newAuthToken)) {
				return {
					...newAuthToken,
					trace: [...newAuthToken.trace, 'AuthService - userRefresh - this.getAuthToken'],
				};
			}

			if (!hasRefreshTokenExpired) return { authToken: newAuthToken, refreshToken };

			const newRefreshToken = await createUserRefreshToken(
				this.securityService.encryptString.bind(this.securityService),
			);
			if (isError(newRefreshToken)) {
				return {
					...newRefreshToken,
					trace: [...newRefreshToken.trace, 'AuthService - userRefresh - createUserRefreshToken'],
				};
			}

			const response = await this.userService.updateUser({
				userId: id,
				updates: { refreshToken: newRefreshToken },
			});
			if (isError(response)) {
				return {
					...response,
					trace: [...response.trace, 'AuthService - userRefresh - this.userService.updateUser'],
				};
			}

			return { authToken: newAuthToken, refreshToken: newRefreshToken };
		} catch (error) {
			return {
				userMessage: 'Error refreshing token!',
				error: 'Error refreshing token!',
				errorType: 'InternalServerErrorException',
				errorData: {
					refreshToken,
					error: returnErrorString(error),
				},
				trace: ['AuthService - userRefresh - catch'],
			};
		}
	}

	/**
	 * Verify auth token
	 */
	async verifyToken(props: {
		authToken: string;
		refreshToken: string;
	}): Promise<DefaultReturnType<VerifyTokenPayloadType>> {
		try {
			const { authToken, refreshToken } = props;

			const authTokenData = await this.jwtService.verifyAsync(authToken);
			if (authTokenData?.id) return authTokenData;

			const isUserValid = await this.verifyUserRefreshToken(refreshToken);
			if (isError(isUserValid)) {
				return {
					...isUserValid,
					trace: [...isUserValid.trace, 'AuthService - verifyToken - this.verifyUserRefreshToken'],
				};
			}

			const { id, email, username } = isUserValid;
			return { id, email, username };
		} catch (error) {
			return {
				userMessage: 'Invalid token!',
				error: 'Invalid token!',
				errorType: 'UnauthorizedException',
				errorData: {
					props,
					error: returnErrorString(error),
				},
				trace: ['AuthService - verifyToken - catch'],
			};
		}
	}

	/**
	 * Verify user refresh token
	 */
	async verifyUserRefreshToken(refreshToken: string): Promise<DefaultReturnType<VerifyUserRefreshTokenReturnType>> {
		const user = await this.userService.getUser({ refreshToken });
		if (isError(user)) {
			return {
				...user,
				trace: [...user.trace, 'AuthService - verifyUserRefreshToken - this.userService.getUser'],
			};
		}

		const refreshTokenData = await decryptUserRefreshToken({
			refreshToken,
			decryptionFunction: this.securityService.decryptString.bind(this.securityService),
		});
		if (isError(refreshTokenData)) {
			return {
				...refreshTokenData,
				trace: [...refreshTokenData.trace, 'AuthService - verifyUserRefreshToken - decryptUserRefreshToken'],
			};
		}

		return {
			id: user.id,
			email: user.email,
			username: user.username,
			created: refreshTokenData.created,
		};
	}

	/**
	 * Generate auth token
	 */
	private async getAuthToken(props: {
		id: string;
		email: string;
		username: string;
	}): Promise<DefaultReturnType<string>> {
		const { id, email, username } = props;

		if (!id || !email || !username) {
			return {
				userMessage: 'Invalid user data for auth token!',
				error: 'Invalid user data for auth token!',
				errorType: 'InternalServerErrorException',
				errorData: { props },
				trace: ['AuthService - getAuthToken - if (!id || !email || !username)'],
			};
		}

		const token = await this.jwtService.signAsync(
			{ id, email, username },
			{ expiresIn: AUTH.ACCESS_TOKEN_VALIDITY },
		);
		if (!token) {
			return {
				userMessage: 'Error generating auth token!',
				error: 'Error generating auth token!',
				errorType: 'InternalServerErrorException',
				errorData: { props },
				trace: ['AuthService - getAuthToken - this.jwtService.signAsync'],
			};
		}

		return token;
	}
}
