import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { v4 as uuid } from 'uuid';
import { OAuth2Client } from 'google-auth-library';

import { CreateUserType, SigninUserType, UpdateUserType, UserType, UserSsoConfigType } from './user.type';
import { REGEX } from 'src/shared/constants/regex.constant';
import { createUserRefreshToken, getNewUsername } from './user.util';
import {
	createUserValidation,
	deleteFileValidation,
	deleteSsoConfigValidation,
	getUserValidation,
	signinUserValidation,
	updateUserValidation,
} from './user.validate';
import { SecurityService } from 'src/shared/security/security.service';
import { validate } from 'src/shared/utils/zod.util';
import { DefaultReturnType } from 'src/shared/types/return.type';
import { USER } from './user.constant';
import { returnErrorString } from 'src/shared/utils/return.util';
import { isError } from 'src/shared/utils/error.util';
import { deleteFile } from 'src/shared/upload/file.service';

/**
 * @summary User service
 * @description Service for handling user operations
 * @functions
 * - getUser
 * - createUser
 * - updateUser
 * - deleteSsoConfig
 * - signinUser
 * - deleteUser
 *
 * @private
 * - validateGoogleSigninToken
 * - verifyGoogleIdToken
 */
@Injectable()
export class UserService {
	constructor(
		private readonly securityService: SecurityService,

		@InjectModel('User') private UserModel: Model<UserType>,
	) {}

	/**
	 * Get user
	 */
	async getUser(props: {
		id?: string;
		email?: string;
		username?: string;
		refreshToken?: string;
	}): Promise<DefaultReturnType<UserType>> {
		const validationResult = validate({ data: props, schema: getUserValidation });
		if (isError(validationResult)) {
			return {
				...validationResult,
				trace: [...validationResult.trace, 'UserService - getUser - validate'],
			};
		}

		const { id, email, username, refreshToken } = validationResult;
		const queryArray: Record<string, string>[] = [];

		if (id) queryArray.push({ id });
		if (username) queryArray.push({ username });
		if (email) queryArray.push({ email });
		if (refreshToken) queryArray.push({ refreshToken });

		const user = await this.UserModel.findOne({ $or: queryArray, accountStatus: { $ne: 'deleted' } })
			.lean()
			.exec();
		if (!user) {
			return {
				userMessage: 'User does not exist!',
				error: 'User does not exist!',
				errorType: 'NotFoundException',
				errorData: { props },
				trace: ['UserService - getUser - if (!user)'],
			};
		}

		return user;
	}

	async createUser(props: CreateUserType): Promise<DefaultReturnType<UserType>> {
		const validationResult = validate({ data: props, schema: createUserValidation });
		if (isError(validationResult)) {
			return {
				...validationResult,
				trace: [...validationResult.trace, 'UserService - createUser - validate'],
			};
		}

		const { email, firstName, lastName, image, password } = validationResult;

		const userExists = await this.getUser({ email });
		if (!isError(userExists)) {
			return {
				userMessage: 'User already exists!',
				error: 'User already exists!',
				errorType: 'ConflictException',
				errorData: { email },
				trace: ['UserService - createUser - this.getUser({ email })'],
			};
		}

		let username = '';
		let usernameExists = true;
		while (usernameExists) {
			username = getNewUsername(firstName);
			const user = await this.getUser({ username });
			if (isError(user)) usernameExists = false;
		}

		const id = uuid();

		const refreshToken = await createUserRefreshToken(
			this.securityService.encryptString.bind(this.securityService),
		);
		if (isError(refreshToken)) {
			return {
				...refreshToken,
				trace: [...refreshToken.trace, 'UserService - createUser - createUserRefreshToken'],
			};
		}

		const newUser: Partial<UserType> = {
			id,
			email,
			username,
			firstName,
			lastName,
			image,
			creationTime: Date.now(),
			accountStatus: 'active',
			refreshToken,
			isAdmin: false,
			ssoConfig: [],
			password,
		};

		const createdUser = await this.UserModel.create(newUser).then((user: any) => user._doc as UserType);
		if (!createdUser) {
			return {
				userMessage: 'Failed to create user!',
				error: 'Failed to create user!',
				errorType: 'InternalServerErrorException',
				errorData: { newUser },
				trace: ['UserService - createUser - if (!createdUser)'],
			};
		}

		return createdUser;
	}

	/**
	 * Update user
	 */
	async updateUser(props: { userId: string; updates: UpdateUserType }): Promise<DefaultReturnType<UserType>> {
		const validationResult = validate({ data: props, schema: updateUserValidation });
		if (isError(validationResult)) {
			return {
				...validationResult,
				trace: [...validationResult.trace, 'UserService - updateUser - validate'],
			};
		}

		const {
			userId,
			updates: { ssoConfig, files, ...data },
		} = validationResult;
		const updatedData: Partial<UserType> = data;

		const user = await this.getUser({ id: userId });
		if (isError(user)) {
			return {
				...user,
				trace: [...user.trace, 'UserService - updateUser - getUser'],
			};
		}

		updatedData.ssoConfig = user.ssoConfig;
		updatedData.files = user.files || [];

		if (data.username) {
			const isUsernameEmail = REGEX.EMAIL.test(data.username);
			if (isUsernameEmail) {
				return {
					userMessage: 'Username cannot be an email address!',
					error: 'Username cannot be an email address!',
					errorType: 'BadRequestException',
					errorData: {},
					trace: ['UserService - updateUser - if (isUsernameEmail)'],
				};
			}
		}
		if (data.email && data.email !== user.email) {
			const newEmailExists = await this.getUser({ email: data.email });
			if (newEmailExists) {
				return {
					userMessage: 'User already exists with this email!',
					error: 'User already exists with this email!',
					errorType: 'ConflictException',
					errorData: {},
					trace: ['UserService - updateUser - if (newEmailExists)'],
				};
			}
		}
		if (data.username) {
			const newUsernameExists = await this.getUser({ username: data.username });
			if (newUsernameExists) {
				return {
					userMessage: 'User already exists with this username!',
					error: 'User already exists with this username!',
					errorType: 'ConflictException',
					errorData: {},
					trace: ['UserService - updateUser - if (newUsernameExists)'],
				};
			}
		}

		if (ssoConfig) {
			if (ssoConfig.id) {
				const configIndex = updatedData.ssoConfig.findIndex((config) => config.id === ssoConfig.id);
				if (configIndex === -1) {
					return {
						userMessage: 'SSO config not found!',
						error: 'SSO config not found!',
						errorType: 'BadRequestException',
						errorData: {},
						trace: ['UserService - updateUser - if (configIndex === -1)'],
					};
				}

				updatedData.ssoConfig[configIndex] = { ...updatedData.ssoConfig[configIndex], ...ssoConfig };
			} else {
				if (!ssoConfig.refresh_token || !ssoConfig.provider) {
					return {
						userMessage: 'SSO config is missing required fields!',
						error: 'SSO config is missing required fields!',
						errorType: 'BadRequestException',
						errorData: {},
						trace: ['UserService - updateUser - if (!ssoConfig.refresh_token || !ssoConfig.provider)'],
					};
				}

				const userDetailsFromIdToken = await this.verifyGoogleIdToken(ssoConfig.id_token);
				if (isError(userDetailsFromIdToken)) {
					return {
						...userDetailsFromIdToken,
						trace: [...userDetailsFromIdToken.trace, 'UserService - updateUser - verifyGoogleIdToken'],
					};
				}

				const filteredConfig = updatedData.ssoConfig.filter(
					(config) => config.email !== userDetailsFromIdToken.email,
				);

				const newConfig = { id: uuid(), created: Date.now(), ...ssoConfig };
				filteredConfig.push(newConfig as UserSsoConfigType);

				updatedData.ssoConfig = filteredConfig;
			}
		}

		if (files) {
			const existingFileIds = updatedData.files.map((file) => file.id);
			const incomingFileIds = files.map((file) => file.id);

			const newIncomingFiles = files.filter((file) => !existingFileIds.includes(file.id));

			const isFileCountExceeded = updatedData.files.length + newIncomingFiles.length > USER.USER_FILE_COUNT;
			if (isFileCountExceeded) {
				return {
					userMessage: 'File count exceeded!',
					error: 'File count exceeded!',
					errorType: 'ForbiddenException',
					errorData: {},
					trace: ['UserService - updateUser - if (isFileCountExceeded)'],
				};
			}

			const uniqueExistingFiles = updatedData.files.filter((file) => !incomingFileIds.includes(file.id));

			files.forEach((file) => {
				const existingData = updatedData.files?.find((item) => item.id === file.id);

				if (existingData) {
					const newFile = { ...existingData, ...file };
					uniqueExistingFiles.push(newFile);
				} else {
					uniqueExistingFiles.push(file);
				}
			});

			updatedData.files = uniqueExistingFiles;
		}

		const updatedUser = await this.UserModel.findOneAndUpdate({ id: user.id }, { $set: updatedData }, { new: true })
			.lean()
			.exec();
		if (!updatedUser) {
			return {
				userMessage: 'Failed to update user!',
				error: 'Failed to update user!',
				errorType: 'InternalServerErrorException',
				errorData: { userId, updatedData },
				trace: ['UserService - updateUser - this.UserModel.findOneAndUpdate'],
			};
		}

		return updatedUser;
	}

	/**
	 * Delete SSO config
	 */
	async deleteSsoConfig(props: { userId: string; configId: string }): Promise<DefaultReturnType<true>> {
		const validationResult = validate({ data: props, schema: deleteSsoConfigValidation });
		if (isError(validationResult)) {
			return {
				...validationResult,
				trace: [...validationResult.trace, 'UserService - deleteSsoConfig - validate'],
			};
		}

		const { userId, configId } = validationResult;

		const user = await this.getUser({ id: userId });
		if (isError(user)) {
			return {
				...user,
				trace: [...user.trace, 'UserService - deleteSsoConfig - getUser'],
			};
		}

		const response = await this.UserModel.findOneAndUpdate(
			{ id: userId },
			{ $pull: { ssoConfig: { id: configId } } },
			{ new: true },
		)
			.lean()
			.exec();
		if (!response) {
			return {
				userMessage: 'Failed to delete SSO config from user!',
				error: 'Failed to delete SSO config from user!',
				errorType: 'InternalServerErrorException',
				errorData: { configId },
				trace: ['UserService - deleteSsoConfig - if (!response)'],
			};
		}

		return true;
	}

	/**
	 * Delete file
	 */
	async deleteFile(props: { userId: string; fileId: string }): Promise<DefaultReturnType<true>> {
		const validationResult = validate({ data: props, schema: deleteFileValidation });
		if (isError(validationResult)) {
			return {
				...validationResult,
				trace: [...validationResult.trace, 'UserService - deleteFile - validate'],
			};
		}

		const { userId, fileId } = validationResult;

		const user = await this.getUser({ id: userId });
		if (isError(user)) {
			return {
				...user,
				trace: [...user.trace, 'UserService - deleteFile - getUser'],
			};
		}

		const file = user.files?.find((file) => file.id === fileId);
		if (!file) {
			return {
				userMessage: 'File not found!',
				error: 'File not found!',
				errorType: 'BadRequestException',
				errorData: { fileId },
				trace: ['UserService - deleteFile - if (!file)'],
			};
		}

		const deleteFileFromStorageResponse = await deleteFile({ filename: file.originalFileName });
		if (isError(deleteFileFromStorageResponse)) {
			return {
				...deleteFileFromStorageResponse,
				trace: [...deleteFileFromStorageResponse.trace, 'UserService - deleteFile - fileService.deleteFile'],
			};
		}

		const response = await this.UserModel.findOneAndUpdate(
			{ id: userId },
			{ $pull: { files: { id: fileId } } },
			{ new: true },
		)
			.lean()
			.exec();
		if (!response) {
			return {
				userMessage: 'Failed to delete file from user uploads!',
				error: 'Failed to delete file from user uploads!',
				errorType: 'InternalServerErrorException',
				errorData: { fileId },
				trace: ['UserService - deleteFile - if (!response)'],
			};
		}

		return true;
	}

	/**
	 * Signin user
	 */
	async signinUser(props: SigninUserType): Promise<DefaultReturnType<UserType>> {
		const validationResult = validate({ data: props, schema: signinUserValidation });
		if (isError(validationResult)) {
			return {
				...validationResult,
				trace: [...validationResult.trace, 'UserService - signinUser - validate'],
			};
		}

		const { emailOrUsername, password } = validationResult;
		const isEmail = REGEX.EMAIL.test(emailOrUsername);

		const user = await this.getUser(isEmail ? { email: emailOrUsername } : { username: emailOrUsername });
		if (isError(user)) {
			return {
				...user,
				trace: [...user.trace, 'UserService - signinUser - getUser'],
			};
		}

		const decryptedIncomingPasswordData = await this.securityService.decryptString({
			value: password || '',
		});
		if (isError(decryptedIncomingPasswordData)) {
			return {
				...decryptedIncomingPasswordData,
				trace: [...decryptedIncomingPasswordData.trace, 'UserService - signinUser - decryptString'],
			};
		}

		const decryptedSavedPasswordData = await this.securityService.decryptString({
			value: user.password || '',
		});
		if (isError(decryptedSavedPasswordData)) {
			return {
				...decryptedSavedPasswordData,
				trace: [...decryptedSavedPasswordData.trace, 'UserService - signinUser - decryptString'],
			};
		}

		const isPasswordMatching = decryptedIncomingPasswordData === decryptedSavedPasswordData;
		if (!isPasswordMatching) {
			return {
				userMessage: 'Invalid password!',
				error: 'Invalid password!',
				errorType: 'UnauthorizedException',
				errorData: {},
				trace: ['UserService - signinUser - if (!isPasswordMatching)'],
			};
		}

		return user;
	}

	/**
	 * Delete user
	 */
	async deleteUser(userId: string): Promise<DefaultReturnType<true>> {
		const user = await this.getUser({ id: userId });
		if (isError(user)) {
			return {
				...user,
				trace: [...user.trace, 'UserService - deleteUser - getUser'],
			};
		}

		const response = await this.UserModel.findOneAndUpdate(
			{ id: userId },
			{ $set: { accountStatus: 'deleted' } },
			{ new: true },
		).exec();
		if (!response) {
			return {
				userMessage: 'Failed to delete user!',
				error: 'Failed to delete user!',
				errorType: 'InternalServerErrorException',
				errorData: { userId },
				trace: ['UserService - deleteUser - if (!response)'],
			};
		}

		return true;
	}

	/**
	 * Verify Google ID token
	 */
	private async verifyGoogleIdToken(idToken: string): Promise<DefaultReturnType<{ name: string; email: string }>> {
		try {
			const client = new OAuth2Client(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);
			const ticket = await client.verifyIdToken({ idToken, audience: process.env.GOOGLE_CLIENT_ID });

			const payload = ticket.getPayload();
			if (!payload) {
				return {
					userMessage: 'Invalid ID token payload!',
					error: 'Invalid ID token payload!',
					errorType: 'BadRequestException',
					errorData: { idToken },
					trace: ['UserService - verifyGoogleIdToken - if (!payload)'],
				};
			}

			if (!payload.email || !payload.name) {
				return {
					userMessage: 'ID token does not contain required fields!',
					error: 'ID token does not contain required fields!',
					errorType: 'BadRequestException',
					errorData: { idToken },
					trace: ['UserService - verifyGoogleIdToken - if (!payload.email || !payload.name)'],
				};
			}

			return { name: payload.name, email: payload.email };
		} catch (error) {
			return {
				userMessage: 'Failed to verify ID token!',
				error: 'Failed to verify ID token!',
				errorType: 'InternalServerErrorException',
				errorData: {
					idToken,
					error: returnErrorString(error),
				},
				trace: ['UserService - verifyGoogleIdToken - catch'],
			};
		}
	}
}
