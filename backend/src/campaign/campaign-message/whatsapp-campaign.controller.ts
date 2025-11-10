import { Controller, Delete, Get, Query } from '@nestjs/common';

import { CampaignMessagesType } from './whatsapp-campaign.type';
import { CampaignMessageService } from './whatsapp-campaign.service';
import { log } from 'src/shared/logger/logger';
import { isError, throwError } from 'src/shared/utils/error.util';
import { UserId } from 'src/auth/user-id.decorator';

/**
 * @summary Campaign message controller
 * @description Controller for campaign message operations
 * @routes
 * - /campaign/campaign-message - GET
 * - /campaign/campaign-message/user - GET
 * - /campaign/campaign-message - DELETE
 *
 * @private
 * - verifyUserId
 */
@Controller('/campaign/messages')
export class CampaignMessageController {
	constructor(private readonly campaignMessageService: CampaignMessageService) {}

	/**
	 * Get campaign messages
	 */
	@Get('/')
	async getCampaignMessages(
		@UserId() userId: string,
		@Query('campaignId') campaignId: string,
	): Promise<CampaignMessagesType> {
		await this.verifyUserId(userId);

		const campaignMessages = await this.campaignMessageService.getCampaignMessages({ campaignId });
		if (isError(campaignMessages)) {
			log(userId, 'error', {
				message: campaignMessages.error,
				data: campaignMessages.errorData,
				trace: [
					...campaignMessages.trace,
					'CampaignMessageController - getCampaignMessages - this.campaignMessageService.getCampaignMessages',
				],
			});
			throwError({ error: campaignMessages.userMessage, errorType: campaignMessages.errorType });
		}

		return campaignMessages;
	}

	/**
	 * Get user campaign messages
	 */
	@Get('/user')
	async getUserCampaignMessages(@UserId() userId: string): Promise<CampaignMessagesType[]> {
		await this.verifyUserId(userId);

		const response = await this.campaignMessageService.getUserCampaignMessages(userId);
		if (isError(response)) {
			log(userId, 'error', {
				message: response.error,
				data: response.errorData,
				trace: [
					...response.trace,
					'CampaignMessageController - getUserCampaignMessages - this.campaignMessageService.getUserCampaignMessages',
				],
			});
			throwError({ error: response.userMessage, errorType: response.errorType });
		}

		return response;
	}

	/**
	 * Delete campaign message
	 */
	@Delete('/')
	async deleteCampaignMessage(@UserId() userId: string, @Query('campaignId') campaignId: string): Promise<true> {
		await this.verifyUserId(userId);

		const response = await this.campaignMessageService.deleteCampaignMessage(campaignId);
		if (isError(response)) {
			log(userId, 'error', {
				message: response.error,
				data: response.errorData,
				trace: [
					...response.trace,
					'CampaignMessageController - deleteCampaignMessage - this.campaignMessageService.deleteCampaignMessage',
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
			log('interact', 'error', {
				message: 'User is unauthorized!',
				data: {},
				trace: ['InteractController - verifyUserId - if (!userId)'],
			});
			throwError({ error: 'User is unauthorized!', errorType: 'UnauthorizedException' });
		}

		return true;
	}
}
