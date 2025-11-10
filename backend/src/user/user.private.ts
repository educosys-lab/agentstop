import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { UserType } from './user.type';
import { getMultipleUsersInternalValidation } from './user.validate';
import { validate } from 'src/shared/utils/zod.util';
import { DefaultReturnType } from 'src/shared/types/return.type';
import { isError } from 'src/shared/utils/error.util';

/**
 * @summary User private service
 * @description Service for handling user operations. This is only for internal use.
 * @functions
 * - getMultipleUsers
 * - getUserCurrentPlan
 */
@Injectable()
export class UserPrivateService {
	constructor(@InjectModel('User') private UserModel: Model<UserType>) {}

	/**
	 * Get multiple users
	 */
	async getMultipleUsersInternal(props: {
		id?: string[];
		email?: string[];
		username?: string[];
	}): Promise<DefaultReturnType<UserType[]>> {
		const validationResult = validate({ data: props, schema: getMultipleUsersInternalValidation });
		if (isError(validationResult)) {
			return {
				...validationResult,
				trace: [...validationResult.trace, 'UserPrivateService - getMultipleUsers - validate'],
			};
		}

		const { id, email, username } = validationResult;
		const queryArray: Record<string, any>[] = [];

		if (id && id.length > 0) queryArray.push({ id: { $in: id } });
		if (email && email.length > 0) queryArray.push({ email: { $in: email } });
		if (username && username.length > 0) queryArray.push({ username: { $in: username } });

		if (queryArray.length === 0) {
			return {
				userMessage: 'User identifier is required!',
				error: 'User identifier is required!',
				errorType: 'BadRequestException',
				errorData: { props },
				trace: ['UserPrivateService - getMultipleUsers - if (queryArray.length === 0)'],
			};
		}

		const users = await this.UserModel.find({ $or: queryArray, accountStatus: { $ne: 'deleted' } })
			.lean()
			.exec();
		if (users.length === 0) {
			return {
				userMessage: 'No users found!',
				error: 'No users found!',
				errorType: 'NotFoundException',
				errorData: { props },
				trace: ['UserPrivateService - getMultipleUsers - if (users.length === 0)'],
			};
		}

		return users;
	}
}
