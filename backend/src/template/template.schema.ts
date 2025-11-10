import { Schema } from 'mongoose';

import { MAX_TITLE_LENGTH } from './template.constant';

export const TemplateSchema = new Schema({
	id: { type: String, required: true, unique: true },
	title: { type: String, required: true, maxlength: MAX_TITLE_LENGTH },
	category: { type: String, required: true },
	subCategory: { type: String, required: true },
	nodes: { type: [Schema.Types.Mixed], default: [] },
	edges: { type: [Schema.Types.Mixed], default: [] },
	preview: { type: String, default: '' },
	notes: { type: String, default: '' },
	viewed: { type: Number, default: 0 },
	used: { type: Number, default: 0 },
	icons: { type: [String], default: [] },
});
