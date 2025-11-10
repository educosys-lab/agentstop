import { z } from 'zod';

export const getCampaignMessagesValidation = z
	.object({
		campaignId: z.string({ message: 'Invalid campaign ID' }).optional(),
		workflowId: z.string({ message: 'Invalid workflow ID' }).optional(),
	})
	.refine((data) => data.campaignId !== undefined || data.workflowId !== undefined, {
		message: 'Campaign ID or workflow ID is required',
	});

export const getUserCampaignMessagesValidation = z.object({
	userId: z.string({ message: 'Invalid user ID' }).min(1, { message: 'User ID is required' }),
});

export const deleteCampaignMessageValidation = z.object({
	campaignId: z.string({ message: 'Invalid campaign ID' }).min(1, { message: 'Campaign ID is required' }),
});
