import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { CampaignMessagesType } from './whatsapp-campaign.type';
import {
	getCampaignMessagesValidation,
	getUserCampaignMessagesValidation,
	deleteCampaignMessageValidation,
} from './whatsapp-campaign.validate';
import { DefaultReturnType } from 'src/shared/types/return.type';
import { validate } from 'src/shared/utils/zod.util';
import { isError } from 'src/shared/utils/error.util';

/**
 * @summary Campaign message service
 * @description Service for campaign message operations
 * @functions
 * - getCampaignMessages
 * - getUserCampaignMessages
 * - deleteCampaignMessage
 */
@Injectable()
export class CampaignMessageService {
	constructor(@InjectModel('CampaignMessages') private CampaignMessageModel: Model<CampaignMessagesType>) {}

	/**
	 * Get campaign messages
	 */
	async getCampaignMessages({
		campaignId,
		workflowId,
	}: {
		campaignId?: string;
		workflowId?: string;
	}): Promise<DefaultReturnType<CampaignMessagesType>> {
		const validationResult = validate({
			data: { campaignId, workflowId },
			schema: getCampaignMessagesValidation,
		});
		if (isError(validationResult)) {
			return {
				...validationResult,
				trace: [...validationResult.trace, 'CampaignMessageService - getCampaignMessages - validate'],
			};
		}

		let campaignMessages: CampaignMessagesType | null = null;

		if (campaignId) {
			campaignMessages = await this.CampaignMessageModel.findOne({ campaignId }).lean().exec();
		} else if (workflowId) {
			campaignMessages = await this.CampaignMessageModel.findOne({ workflowId })
				.sort({ created: -1 })
				.lean()
				.exec();
		}

		if (!campaignMessages) {
			return {
				userMessage: 'Campaign messages not found!',
				error: 'Campaign messages not found!',
				errorType: 'BadRequestException',
				errorData: { campaignId, workflowId },
				trace: ['CampaignMessageService - getCampaignMessages - this.CampaignMessageModel.findOne'],
			};
		}

		return campaignMessages;
	}

	/**
	 * Get user campaign messages
	 */
	async getUserCampaignMessages(userId: string): Promise<DefaultReturnType<CampaignMessagesType[]>> {
		const validationResult = validate({ data: { userId }, schema: getUserCampaignMessagesValidation });
		if (isError(validationResult)) {
			return {
				...validationResult,
				trace: [...validationResult.trace, 'CampaignMessageService - getUserCampaignMessages - validate'],
			};
		}

		const campaignMessages = await this.CampaignMessageModel.find({ userId }).lean().exec();
		if (!campaignMessages) return [];

		return campaignMessages;
	}

	/**
	 * Delete campaign message
	 */
	async deleteCampaignMessage(campaignId: string): Promise<DefaultReturnType<true>> {
		const validationResult = validate({ data: { campaignId }, schema: deleteCampaignMessageValidation });
		if (isError(validationResult)) {
			return {
				...validationResult,
				trace: [...validationResult.trace, 'CampaignMessageService - deleteCampaignMessage - validate'],
			};
		}

		const campaignMessage = await this.CampaignMessageModel.findOneAndDelete({
			campaignId: validationResult.campaignId,
		})
			.lean()
			.exec();
		if (!campaignMessage) {
			return {
				userMessage: 'Campaign message not found!',
				error: 'Campaign message not found!',
				errorType: 'BadRequestException',
				errorData: { campaignId },
				trace: ['CampaignMessageService - deleteCampaignMessage - this.CampaignMessageModel.findOneAndDelete'],
			};
		}

		return true;
	}
}
