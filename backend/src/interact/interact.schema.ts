import { Schema } from 'mongoose';

import { responderDataFormats } from 'src/workflow-system/workflow-system.type';

const MessageSchema = new Schema({
	id: { type: String, required: true },
	createTime: { type: Number, required: true },
	senderId: { type: String, required: true },
	content: { type: String, required: true },
	format: { type: String, enum: responderDataFormats, required: true },
});

export const InteractSchema = new Schema({
	workflowId: { type: String, required: true, unique: true },
	messages: { type: [MessageSchema], default: [] },
	members: {
		type: [
			{
				userId: { type: String, required: true },
				joinTime: { type: Number, default: Date.now() },
				isDeleted: { type: Boolean, default: false },
			},
		],
		required: true,
		default: [],
	},
	isDeleted: { type: Boolean, default: false },
});
