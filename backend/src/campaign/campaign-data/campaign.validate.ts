import { z } from 'zod';

export const getCampaignValidation = z.object({
	campaignId: z.string({ message: 'Invalid campaign ID' }),
});

export const getUserInteractsValidation = z.object({
	userId: z.string({ message: 'Invalid user ID' }).min(1, { message: 'User ID is required' }),
});
