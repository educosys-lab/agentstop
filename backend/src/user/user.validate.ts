import { z } from 'zod';

import { SOCIAL_SIGNIN } from './user.type';

export const getUserValidation = z
	.object({
		id: z.string({ message: 'Invalid ID' }).optional(),
		email: z.string({ message: 'Invalid email' }).email({ message: 'Invalid email' }).optional(),
		username: z.string({ message: 'Invalid username' }).optional(),
		refreshToken: z.string({ message: 'Invalid refresh token' }).optional(),
	})
	.refine(
		(data) =>
			data.id !== undefined ||
			data.email !== undefined ||
			data.username !== undefined ||
			data.refreshToken !== undefined,
		{
			message: 'User identifier is required',
		},
	);

export const createUserValidation = z.object({
	email: z
		.string({ message: 'Invalid email' })
		.email({ message: 'Invalid email' })
		.min(1, { message: 'Email is required' }),
	firstName: z.string({ message: 'Invalid first name' }).min(1, { message: 'First name is required' }),
	lastName: z.string({ message: 'Invalid last name' }).optional(),
	image: z.string({ message: 'Invalid image' }).optional(),
	password: z.string({ message: 'Invalid password' }).min(1, { message: 'Password is required' }),
});

export const updateUserValidation = z.object({
	userId: z.string({ message: 'Invalid user ID' }).min(1, { message: 'User ID is required' }),
	updates: z.object(
		{
			email: z.string({ message: 'Invalid email' }).email({ message: 'Invalid email' }).optional(),
			username: z.string({ message: 'Invalid username' }).optional(),
			firstName: z.string({ message: 'Invalid first name' }).optional(),
			lastName: z.string({ message: 'Invalid last name' }).optional(),
			image: z.string({ message: 'Invalid image' }).optional(),
			ssoConfig: z
				.object(
					{
						id: z.string({ message: 'Invalid SSO ID' }).optional(),
						access_token: z
							.string({ message: 'Invalid SSO access token' })
							.min(1, { message: 'Access token is required' }),
						refresh_token: z.string({ message: 'Invalid SSO refresh token' }).optional(),
						id_token: z
							.string({ message: 'Invalid SSO ID token' })
							.min(1, { message: 'SSO ID token is required' }),
						name: z.string({ message: 'Invalid SSO name' }).min(1, { message: 'SSO name is required' }),
						email: z
							.string({ message: 'Invalid SSO email' })
							.email({ message: 'Invalid SSO email' })
							.min(1, { message: 'SSO email is required' }),
						provider: z.enum(SOCIAL_SIGNIN, { message: 'Unsupported SSO provider' }).optional(),
					},
					{ message: 'Invalid SSO config' },
				)
				.optional(),

			files: z
				.array(
					z.object({
						id: z.string({ message: 'Invalid file ID' }),
						fileName: z.string({ message: 'Invalid file name' }),
						originalFileName: z.string({ message: 'Invalid original file name' }),
						url: z.string({ message: 'Invalid file URL' }),
						uploadTime: z.number({ message: 'Invalid upload time' }),
						metadata: z.object({}, { message: 'Invalid metadata' }).passthrough().optional(),
					}),
					{ message: 'Invalid files' },
				)
				.optional(),
			refreshToken: z.string({ message: 'Invalid refresh token' }).optional(),
		},
		{ message: 'Invalid user updates' },
	),
});

export const deleteSsoConfigValidation = z.object({
	userId: z.string({ message: 'Invalid user ID' }).min(1, { message: 'User ID is required' }),
	configId: z.string({ message: 'Invalid SSO config ID' }).min(1, { message: 'SSO config ID is required' }),
});

export const deleteFileValidation = z.object({
	userId: z.string({ message: 'Invalid user ID' }).min(1, { message: 'User ID is required' }),
	fileId: z.string({ message: 'Invalid file ID' }).min(1, { message: 'File ID is required' }),
});

export const signinUserValidation = z.object({
	emailOrUsername: z.string({ message: 'Invalid email/username' }).min(1, { message: 'Email/Username is required' }),
	password: z.string({ message: 'Invalid password' }).min(1, { message: 'Password is required' }),
});

export const getMultipleUsersInternalValidation = z
	.object({
		id: z.array(z.string({ message: 'Invalid ID' }), { message: 'Invalid ID' }).optional(),
		email: z
			.array(z.string({ message: 'Invalid email' }).email({ message: 'Invalid email' }), {
				message: 'Invalid email',
			})
			.optional(),
		username: z.array(z.string({ message: 'Invalid username' }), { message: 'Invalid username' }).optional(),
	})
	.refine((data) => data.id !== undefined || data.email !== undefined || data.username !== undefined, {
		message: 'User identifier is required',
	});
