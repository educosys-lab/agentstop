export type VerifyTokenPayloadType = {
	id: string;
	email: string;
	username: string;
};

export type VerifyUserRefreshTokenReturnType = {
	id: string;
	email: string;
	username: string;
	created: number;
};
