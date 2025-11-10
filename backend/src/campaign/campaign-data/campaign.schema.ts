import { Schema } from 'mongoose';

import { CAMPAIGN_TYPE } from './campaign.type';

export const CampaignDataSchema = new Schema({
	id: { type: String, required: true, unique: true },
	userId: { type: String, required: true },
	campaignName: { type: String, required: true },
	created: { type: Number, required: true, default: Date.now() },
	templateName: String,
	type: { type: String, enum: CAMPAIGN_TYPE, required: true },
});
