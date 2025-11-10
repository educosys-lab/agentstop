import { Controller, Get, Query } from '@nestjs/common';

import { CampaignDataType } from './campaign.type';
import { CampaignDataService } from './campaign.service';
import { log } from 'src/shared/logger/logger';
import { isError, throwError } from 'src/shared/utils/error.util';
import { UserId } from 'src/auth/user-id.decorator';

/**
 * @summary Campaign controller
 * @description Controller for campaign operations
 * @routes
 * - /campaign/campaign-data - GET
 * - /campaign/campaign-data/user - GET
 *
 * @private
 * - verifyUserId
 */
@Controller('/campaign/campaign-data')
export class CampaignDataController {
	constructor(private readonly campaignDataService: CampaignDataService) {}

	/**
	 * Get campaign
	 */
	@Get('/')
	async getAnalytics(@UserId() userId: string, @Query('campaignId') campaignId: string): Promise<CampaignDataType> {
		await this.verifyUserId(userId);

		const campaign = await this.campaignDataService.getCampaign(campaignId);
		if (isError(campaign)) {
			log(userId, 'error', {
				message: campaign.error,
				data: campaign.errorData,
				trace: [
					...campaign.trace,
					'CampaignDataController - getCampaign - this.campaignDataService.getCampaign',
				],
			});
			throwError({ error: campaign.userMessage, errorType: campaign.errorType });
		}

		return campaign;
	}

	/**
	 * Get user campaigns
	 */
	@Get('/user')
	async getUserCampaigns(@UserId() userId: string): Promise<CampaignDataType[]> {
		await this.verifyUserId(userId);

		const response = await this.campaignDataService.getUserCampaigns(userId);
		if (isError(response)) {
			log(userId, 'error', {
				message: response.error,
				data: response.errorData,
				trace: [
					...response.trace,
					'CampaignDataController - getUserCampaigns - this.campaignDataService.getUserCampaigns',
				],
			});
			throwError({ error: response.userMessage, errorType: response.errorType });
		}

		return response;
	}

	/**
	 * Verify user ID
	 */
	private async verifyUserId(userId: string | undefined): Promise<true> {
		if (!userId) {
			log('campaign', 'error', {
				message: 'User is unauthorized!',
				data: {},
				trace: ['CampaignDataController - verifyUserId - if (!userId)'],
			});
			throwError({ error: 'User is unauthorized!', errorType: 'UnauthorizedException' });
		}

		return true;
	}
}
