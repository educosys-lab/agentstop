import axios from 'axios';

import { DefaultReturnType } from '../types/return.type';
import { returnErrorString } from './return.util';

export const refreshAccessToken = async (
	refresh_token: string,
): Promise<DefaultReturnType<{ access_token: string; id_token: string }>> => {
	try {
		const response = await axios.post(
			'https://oauth2.googleapis.com/token',
			new URLSearchParams({
				client_id: process.env.GOOGLE_CLIENT_ID!,
				client_secret: process.env.GOOGLE_CLIENT_SECRET!,
				refresh_token,
				grant_type: 'refresh_token',
			}),
		);

		return { access_token: response.data.access_token, id_token: response.data.id_token };
	} catch (error) {
		return {
			userMessage: 'Error refreshing Google access token!',
			error: 'Error refreshing Google access token!',
			errorType: 'InternalServerErrorException',
			errorData: {
				refresh_token,
				error: returnErrorString(error),
			},
			trace: ['refreshAccessToken - catch'],
		};
	}
};

export const isAccessTokenValid = async (accessToken: string): Promise<DefaultReturnType<true>> => {
	try {
		await axios.get('https://www.googleapis.com/oauth2/v1/userinfo', {
			headers: { Authorization: `Bearer ${accessToken}` },
		});
		return true;
	} catch (error) {
		return {
			userMessage: 'Invalid Google access token!',
			error: 'Invalid Google access token!',
			errorType: 'UnauthorizedException',
			errorData: {
				accessToken,
				error: returnErrorString(error),
			},
			trace: ['isAccessTokenValid - catch'],
		};
	}
};
