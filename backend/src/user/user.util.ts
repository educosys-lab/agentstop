import { v4 as uuid } from 'uuid';

import { generateRandomString } from 'src/shared/utils/string.util';
import { DecryptUserRefreshTokenReturnType, omittedUserFields, PublicUserType, UserType } from './user.type';
import { DefaultReturnType } from 'src/shared/types/return.type';
import { parseJson } from 'src/shared/utils/json.util';
import { returnErrorString } from 'src/shared/utils/return.util';
import { isError } from 'src/shared/utils/error.util';

export const getNewUsername = (firstName: string) => {
	const refinedFirstName = firstName.trim().split(' ').join('-').toLowerCase();
	const randomString = generateRandomString(3);
	return `${refinedFirstName}-${randomString}`;
};

export const getPublicUserData = (user: UserType): DefaultReturnType<PublicUserType> => {
	try {
		const updatedUser: { [key: string]: any } = { ...user };

		omittedUserFields.forEach((field) => delete updatedUser[field]);
		if (user.isAdmin) updatedUser.isAdmin = true;

		return updatedUser as PublicUserType;
	} catch (error) {
		return {
			userMessage: 'User data error!',
			error: 'Failed to format user data!',
			errorType: 'BadRequestException',
			errorData: {
				userId: user.id,
				error: returnErrorString(error),
			},
			trace: ['getPublicUserData - catch'],
		};
	}
};

export const createUserRefreshToken = async (
	encryptionFunction: (props: { key?: string; value: string }) => Promise<DefaultReturnType<string>>,
): Promise<DefaultReturnType<string>> => {
	const refreshToken = { token: uuid(), created: Date.now() };

	const encryptedData = await encryptionFunction({ value: JSON.stringify(refreshToken) });
	if (isError(encryptedData)) {
		return {
			...encryptedData,
			trace: [...encryptedData.trace, 'createUserRefreshToken - encryptionFunction'],
		};
	}

	return encryptedData;
};

export const decryptUserRefreshToken = async (props: {
	refreshToken: string;
	decryptionFunction: <T>(props: { key?: string; value: string }) => Promise<DefaultReturnType<T>>;
}): Promise<DefaultReturnType<DecryptUserRefreshTokenReturnType>> => {
	const { refreshToken, decryptionFunction } = props;

	const decryptedData = await decryptionFunction<DecryptUserRefreshTokenReturnType>({ value: refreshToken });

	const parsedData = parseJson<DecryptUserRefreshTokenReturnType>(decryptedData);
	if (isError(parsedData)) {
		return {
			...parsedData,
			trace: [...parsedData.trace, 'decryptUserRefreshToken - parseJson'],
		};
	}

	return parsedData;
};
