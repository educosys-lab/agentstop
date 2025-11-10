import { Body, Controller, Delete, Get, Patch, Query } from '@nestjs/common';

import { UserService } from './user.service';

import { PublicUserType, UpdateUserType } from './user.type';
import { Public } from 'src/auth/public.decorator';
import { isError, throwError } from 'src/shared/utils/error.util';
import { getPublicUserData } from './user.util';
import { UserId } from 'src/auth/user-id.decorator';
import { log } from 'src/shared/logger/logger';

/**
 * @summary User controller
 * @description Controller for handling user routes
 * @routes
 * - /user - GET - Public
 * - /user - PATCH
 * - /user/delete-sso-config - DELETE
 * - /user - DELETE
 *
 * @private
 * - verifyUserId
 */
@Controller('/user')
export class UserController {
	constructor(private readonly userService: UserService) {}

	/**
	 * Get user
	 */
	@Public()
	@Get('/')
	async getUser(@UserId() userId: string, @Query('email') email: string): Promise<PublicUserType> {
		const user = await this.userService.getUser({ id: userId, email });
		if (isError(user)) {
			log(userId || 'user', 'error', {
				message: user.error,
				data: user.errorData,
				trace: [...user.trace, 'UserController - getUser - this.userService.getUser'],
			});
			throwError({ error: user.userMessage, errorType: user.errorType });
		}

		const publicData = getPublicUserData(user);
		if (isError(publicData)) {
			throwError({ error: publicData.userMessage, errorType: publicData.errorType });
		}

		return publicData;
	}

	/**
	 * Get user id
	 */
	@Public()
	@Get('/id')
	async getUserId(@Query('email') email: string): Promise<string> {
		const user = await this.userService.getUser({ email });
		if (isError(user)) {
			log('user', 'error', {
				message: user.error,
				data: user.errorData,
				trace: [...user.trace, 'UserController - getUserId - this.userService.getUser'],
			});
			throwError({ error: user.userMessage, errorType: user.errorType });
		}
		return user.id;
	}

	/**
	 * Update user
	 */
	@Patch('/')
	async updateUser(@UserId() userId: string, @Body() props: UpdateUserType): Promise<PublicUserType> {
		await this.verifyUserId(userId);

		const response = await this.userService.updateUser({ userId, updates: props });
		if (isError(response)) {
			log(userId, 'error', {
				message: response.error,
				data: response.errorData,
				trace: [...response.trace, 'UserController - updateUser - this.userService.updateUser'],
			});
			throwError({ error: response.userMessage, errorType: response.errorType });
		}

		const publicData = getPublicUserData(response);
		if (isError(publicData)) {
			log(userId, 'error', {
				message: publicData.error,
				data: publicData.errorData,
				trace: [...publicData.trace, 'UserController - updateUser - getPublicUserData'],
			});
			throwError({ error: publicData.userMessage, errorType: publicData.errorType });
		}

		return publicData;
	}

	/**
	 * Delete SSO config
	 */
	@Delete('/delete-sso-config')
	async deleteSsoConfig(@UserId() userId: string, @Query('id') id: string): Promise<true> {
		await this.verifyUserId(userId);

		const response = await this.userService.deleteSsoConfig({ userId, configId: id });
		if (isError(response)) {
			log(userId, 'error', {
				message: response.error,
				data: response.errorData,
				trace: [...response.trace, 'UserController - deleteSsoConfig - this.userService.deleteSsoConfig'],
			});
			throwError({ error: response.userMessage, errorType: response.errorType });
		}

		return response;
	}

	/**
	 * Delete file
	 */
	@Delete('/delete-file')
	async deleteFile(@UserId() userId: string, @Query('id') id: string): Promise<true> {
		await this.verifyUserId(userId);

		const response = await this.userService.deleteFile({ userId, fileId: id });
		if (isError(response)) {
			log(userId, 'error', {
				message: response.error,
				data: response.errorData,
				trace: [...response.trace, 'UserController - deleteFile - this.userService.deleteFile'],
			});
			throwError({ error: response.userMessage, errorType: response.errorType });
		}

		return response;
	}

	/**
	 * Delete user
	 */
	@Delete('/')
	async deleteUser(@UserId() userId: string): Promise<true> {
		await this.verifyUserId(userId);

		const response = await this.userService.deleteUser(userId);
		if (isError(response)) {
			log(userId, 'error', {
				message: response.error,
				data: response.errorData,
				trace: [...response.trace, 'UserController - deleteUser - this.userService.deleteUser'],
			});
			throwError({ error: response.userMessage, errorType: response.errorType });
		}

		return response;
	}

	/**
	 * Verify user id
	 */
	private async verifyUserId(userId: string | undefined): Promise<true> {
		if (!userId) {
			log('user', 'error', {
				message: 'User is unauthorized!',
				data: {},
				trace: ['UserController - verifyUser - if (!userId)'],
			});
			throwError({ error: 'User is unauthorized!', errorType: 'UnauthorizedException' });
		}

		return true;
	}
}
