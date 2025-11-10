import { Schema } from 'mongoose';

export const WorkflowTriggersSchema = new Schema({
	content: { type: String, unique: true, required: true },
	type: { type: String, required: true },
	workflowId: { type: String, required: true },
});
