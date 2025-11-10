export const SOCIAL_SIGNIN = ['google', 'microsoft'] as const;

export const USER_ACCOUNT_STATUS = ['active', 'deleted', 'suspended'] as const;
export type UserAccountStatusType = (typeof USER_ACCOUNT_STATUS)[number];

export type UserType = {
	id: string;
	email: string;
	password: string;
	username: string;
	firstName: string;
	lastName: string;
	image: string;
	isAdmin: boolean;
	creationTime: number;
	accountStatus: UserAccountStatusType;
	ssoConfig: UserSsoConfigType[];
	files?: {
		id: string;
		fileName: string;
		originalFileName: string;
		url: string;
		uploadTime: number;
		metadata?: Record<string, any>;
	}[];
	refreshToken: string;
};

export type UserSsoConfigType = {
	id: string;
	access_token: string;
	refresh_token: string;
	id_token: string;
	created: number;
	name: string;
	email: string;
	provider: 'google' | 'linkedin';
};

export const omittedUserFields = [
	'_id',
	'__v',
	'id',
	'password',
	'isAdmin',
	'creationTime',
	'accountStatus',
	'refreshToken',
] as const;

export type PublicUserType = Omit<UserType, (typeof omittedUserFields)[number]>;

export type CreateUserType = {
	email: UserType['email'];
	password: UserType['password'];
	firstName: UserType['firstName'];
	lastName?: UserType['lastName'];
	image?: UserType['image'];
};

export type UpdateUserType = Partial<
	Omit<UserType, 'id' | 'isAdmin' | 'creationTime' | 'accountStatus' | 'ssoConfig'> & {
		ssoConfig: AddSsoConfigType;
	}
>;

export type AddSsoConfigType = {
	id?: UserType['ssoConfig'][number]['id'];
	access_token: UserType['ssoConfig'][number]['access_token'];
	refresh_token?: UserType['ssoConfig'][number]['refresh_token'];
	id_token: UserType['ssoConfig'][number]['id_token'];
	name: UserType['ssoConfig'][number]['name'];
	email: UserType['ssoConfig'][number]['email'];
	provider?: UserType['ssoConfig'][number]['provider'];
};

export type SigninUserType = { type: 'cred'; emailOrUsername: UserType['email']; password: UserType['password'] };

export type GoogleTokenVerifySuccessType = {
	issued_to: string;
	audience: string;
	user_id: string;
	scope: string;
	expires_in: number;
	email: string;
	verified_email: boolean;
	access_type: string;
};

export type GoogleTokenVerifyErrorType = {
	error: string;
	error_description: string;
};

export type DecryptUserRefreshTokenReturnType = { token: string; created: number };
