import { PaymentFrequencyType, PaymentType } from './payment.type';

export const SOCIAL_SIGNIN = {
	GOOGLE: 'google',
	MICROSOFT: 'microsoft',
} as const;

export type SocialSigninType = (typeof SOCIAL_SIGNIN)[keyof typeof SOCIAL_SIGNIN];

export const ACCOUNT_TYPE = {
	FREE: 'free',
	PRO: 'pro',
	SUPER_PRO: 'superPro',
} as const;

export type AccountType = (typeof ACCOUNT_TYPE)[keyof typeof ACCOUNT_TYPE];

export type UserType = {
	email: string;
	username: string;
	firstName: string;
	lastName: string;
	image: string;
	isAdmin?: boolean;
	plan: {
		planName: AccountType;
		startDate: number;
		endDate: number;
		id: string | undefined;
		orderId: PaymentType['orderId'] | undefined;
		subscriptionId: PaymentType['subscriptionId'] | undefined;
		subscriptionInterval: PaymentFrequencyType | undefined;
	};
	balance: {
		wallet: number;
		extraMissions: number;
		extraMissionRuns: number;
	};
};

export type UserPlanType = { planName: AccountType; startDate: number; endDate: number };

export type UserFileType = {
	id: string;
	fileName: string;
	originalFileName: string;
	url: string;
	uploadTime: number;
	metadata?: Record<string, any>;
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

export type UpdateUserType = Partial<
	Omit<
		UserType,
		| 'id'
		| 'isAdmin'
		| 'creationTime'
		| 'verificationCode'
		| 'verificationCodeExpiry'
		| 'accountStatus'
		| 'ssoConfig'
		| 'plan'
		| 'balance'
		| 'socialSignin'
	> & {
		ssoConfig: AddSsoConfigType;
		files: UserFileType[];
		balance: Partial<UserType['balance']>;
	}
>;

export type AddSsoConfigType = {
	id?: UserSsoConfigType['id'];
	access_token: UserSsoConfigType['access_token'];
	refresh_token?: UserSsoConfigType['refresh_token'];
	id_token: UserSsoConfigType['id_token'];
	name: UserSsoConfigType['name'];
	email: UserSsoConfigType['email'];
	provider?: UserSsoConfigType['provider'];
};

export type SigninUserType = { type: 'cred'; emailOrUsername: UserType['email']; password: string };

export type SigninSsoUserType = {
	token: string;
	type: SocialSigninType;
	email: UserType['email'];
	name: string;
	firstName: UserType['firstName'];
	lastName?: UserType['lastName'];
	image?: UserType['image'];
};

export type SignupWithCredentialType = {
	email: UserType['email'];
	password: string;
	firstName: UserType['firstName'];
	lastName: UserType['lastName'];
};

export type SignupSsoType = {
	email: UserType['email'];
	firstName: UserType['firstName'];
	lastName?: UserType['lastName'];
	image?: UserType['image'];
	socialSignin: SocialSigninType;
};

export type SignupUserType = SignupWithCredentialType | SignupSsoType;

export type VerifyUserType = { email: UserType['email']; verificationCode: string };

export type ResetUserPasswordType = {
	email: UserType['email'];
	password: string;
	verificationCode: string;
};
