import { Schema } from 'mongoose';
import { v4 as uuid } from 'uuid';

import { WORKFLOW_STATUS } from './workflow.type';

export const MAX_TITLE_LENGTH = 15;

export const WorkflowSchema = new Schema({
	id: { type: String, default: uuid(), unique: true },
	createdBy: { type: String, required: true },
	title: { type: String, required: true, maxlength: MAX_TITLE_LENGTH },
	createTime: { type: Number, default: Date.now() },
	updateTime: { type: Number, default: Date.now() },
	nodes: { type: [Schema.Types.Mixed], default: [] },
	edges: { type: [Schema.Types.Mixed], default: [] },
	isPublic: { type: Boolean, default: false },
	preview: { type: String, default: '' },
	notes: { type: String, default: '' },
	status: { type: String, enum: Object.values(WORKFLOW_STATUS), default: 'inactive' },
	config: { type: Schema.Types.Mixed, default: {} },
	report: {
		type: [
			{
				_id: false,
				executionId: { type: String, required: true },
				executionTime: { type: Number, required: true },
				executionStatus: { type: String, enum: ['success', 'failed'], required: true },
			},
		],
		required: true,
		default: [],
	},
	generalSettings: {
		type: {
			_id: false,
			showResultFromAllNodes: { type: Boolean, default: false },
		},
		default: {},
	},
});
