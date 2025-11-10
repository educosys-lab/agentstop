import { Schema } from 'mongoose';

import { MESSAGE_STATUS } from './whatsapp-campaign.type';

export const CampaignMessageSchema = new Schema({
	campaignId: { type: String, required: true, unique: true },
	userId: { type: String, required: true },
	workflowId: { type: String, required: true },
	nodeId: { type: String, required: true },
	messages: {
		type: [
			{
				_id: false,
				receiverMobile: { type: String, required: true, unique: true },
				content: {
					type: [
						{
							_id: false,
							messageId: { type: String, required: true, unique: true },
							messageContent: { type: String, required: true },
							timestamp: { type: Number, required: true },
							status: { type: String, enum: MESSAGE_STATUS, required: true },
						},
					],
					default: [],
				},
			},
		],
		default: [],
	},
});
