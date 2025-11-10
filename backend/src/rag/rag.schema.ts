import { Schema } from 'mongoose';

export const RagSchema = new Schema({
	id: { type: String, required: true, unique: true },
	userId: { type: String, required: true },
	sourceName: { type: String, required: true },
	creationTime: { type: Number, required: true, default: Date.now() },
});
