import { Schema } from 'mongoose';

import { USER_ACCOUNT_STATUS } from './user.type';

export const UserSchema = new Schema({
	id: { type: String, required: true, unique: true },
	email: { type: String, required: true, unique: true },
	password: { type: String, required: true },
	username: { type: String, required: true, unique: true },
	firstName: { type: String, required: true },
	lastName: { type: String, default: '' },
	image: { type: String, default: '' },
	isAdmin: { type: Boolean, default: false },
	creationTime: { type: Number, default: Date.now() },
	accountStatus: { type: String, enum: USER_ACCOUNT_STATUS, default: 'active' },
	refreshToken: { type: String, required: true, unique: true },
	ssoConfig: {
		type: [
			{
				_id: false,
				id: { type: String, required: true },
				access_token: { type: String, required: true },
				refresh_token: { type: String, required: true },
				id_token: String,
				created: { type: Number, required: true },
				name: String,
				email: String,
				provider: { type: String, enum: ['google', 'linkedin'], required: true },
			},
		],
		default: [],
	},
	files: {
		type: [
			{
				_id: false,
				id: { type: String, required: true },
				fileName: { type: String, required: true },
				originalFileName: { type: String, required: true },
				url: { type: String, required: true },
				uploadTime: { type: Number, required: true },
				metadata: { type: Object, default: {} },
			},
		],
		default: [],
	},
});
