import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { CampaignDataType } from './campaign.type';
import { getUserInteractsValidation, getCampaignValidation } from './campaign.validate';
import { DefaultReturnType } from 'src/shared/types/return.type';
import { validate } from 'src/shared/utils/zod.util';
import { isError } from 'src/shared/utils/error.util';

/**
 * @summary Campaign data service
 * @description Service for campaign data operations
 * @functions
 * - getCampaign
 * - getUserCampaigns
 */
@Injectable()
export class CampaignDataService {
	constructor(@InjectModel('Campaigns') private CampaignModel: Model<CampaignDataType>) {}

	/**
	 * Get campaign
	 */
	async getCampaign(campaignId: string): Promise<DefaultReturnType<CampaignDataType>> {
		const validationResult = validate({
			data: { campaignId },
			schema: getCampaignValidation,
		});
		if (isError(validationResult)) {
			return {
				...validationResult,
				trace: [...validationResult.trace, 'CampaignDataService - getCampaign - validate'],
			};
		}

		const campaign = await this.CampaignModel.findOne({ id: campaignId }).lean().exec();
		if (!campaign) {
			return {
				userMessage: 'Campaign not found!',
				error: 'Campaign not found!',
				errorType: 'BadRequestException',
				errorData: { campaignId },
				trace: ['CampaignDataService - getCampaign - this.CampaignModel.findOne'],
			};
		}

		return campaign;
	}

	/**
	 * Get user campaigns
	 */
	async getUserCampaigns(userId: string): Promise<DefaultReturnType<CampaignDataType[]>> {
		const validationResult = validate({ data: { userId }, schema: getUserInteractsValidation });
		if (isError(validationResult)) {
			return {
				...validationResult,
				trace: [...validationResult.trace, 'CampaignDataService - getUserCampaigns - validate'],
			};
		}

		const campaigns = await this.CampaignModel.find({ userId }).lean().exec();
		if (!campaigns) return [];

		return campaigns;
	}
}
