import { Controller, Get, Query } from '@nestjs/common';

import { CampaignAnalyticsService } from './campaign-analytics.service';
import { log } from 'src/shared/logger/logger';
import { isError, throwError } from 'src/shared/utils/error.util';
import { UserId } from 'src/auth/user-id.decorator';
import { CampaignAnalyticsType } from './campaign-analytics.type';

/**
 * @summary Campaign analytics controller
 * @description Controller for campaign analytics operations
 * @routes
 * - /campaign/campaign-analytics - GET
 * - /campaign/campaign-analytics/user - GET
 *
 * @private
 * - verifyUserId
 */
@Controller('/campaign/campaign-analytics')
export class CampaignAnalyticsController {
	constructor(private readonly campaignAnalyticsService: CampaignAnalyticsService) {}

	/**
	 * Get campaign analytics
	 */
	@Get('/')
	async getAnalytics(
		@UserId() userId: string,
		@Query('campaignId') campaignId?: string,
		@Query('workflowId') workflowId?: string,
	): Promise<CampaignAnalyticsType> {
		await this.verifyUserId(userId);

		const campaign = await this.campaignAnalyticsService.getCampaignAnalytics({ campaignId, workflowId });
		if (isError(campaign)) {
			log(userId, 'error', {
				message: campaign.error,
				data: campaign.errorData,
				trace: [
					...campaign.trace,
					'CampaignAnalyticsController - getCampaign - this.campaignAnalyticsService.getCampaign',
				],
			});
			throwError({ error: campaign.userMessage, errorType: campaign.errorType });
		}

		return campaign;
	}

	/**
	 * Get user campaigns analytics
	 */
	@Get('/user')
	async getUserCampaignsAnalytics(@UserId() userId: string): Promise<CampaignAnalyticsType[]> {
		await this.verifyUserId(userId);

		const response = await this.campaignAnalyticsService.getUserCampaignsAnalytics(userId);
		if (isError(response)) {
			log(userId, 'error', {
				message: response.error,
				data: response.errorData,
				trace: [
					...response.trace,
					'CampaignAnalyticsController - getUserCampaignsAnalytics - this.campaignAnalyticsService.getUserCampaignsAnalytics',
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
				trace: ['CampaignAnalyticsController - verifyUserId - if (!userId)'],
			});
			throwError({ error: 'User is unauthorized!', errorType: 'UnauthorizedException' });
		}

		return true;
	}
}
