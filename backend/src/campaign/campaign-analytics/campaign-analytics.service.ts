import { Injectable } from '@nestjs/common';

import { DefaultReturnType } from 'src/shared/types/return.type';
import { isError } from 'src/shared/utils/error.util';
import { CampaignAnalyticsType } from './campaign-analytics.type';
import { CampaignDataService } from '../campaign-data/campaign.service';
import { CampaignMessageService } from '../campaign-message/whatsapp-campaign.service';
import { WorkflowPrivateService } from 'src/workflow/workflow.private';
import { CampaignMessagesType } from '../campaign-message/whatsapp-campaign.type';
import { TIME } from 'src/shared/constants/time.constant';

/**
 * @summary Campaign analytics service
 * @description Service for campaign analytics operations
 * @functions
 * - getCampaign
 * - getUserCampaigns
 */
@Injectable()
export class CampaignAnalyticsService {
	constructor(
		private readonly campaignDataService: CampaignDataService,
		private readonly campaignMessagesService: CampaignMessageService,
		private readonly workflowPrivateService: WorkflowPrivateService,
	) {}

	/**
	 * Get campaign analytics
	 */
	async getCampaignAnalytics({
		campaignId,
		workflowId,
	}: {
		campaignId?: string;
		workflowId?: string;
	}): Promise<DefaultReturnType<CampaignAnalyticsType>> {
		const campaignMessages = await this.campaignMessagesService.getCampaignMessages({ campaignId, workflowId });
		if (isError(campaignMessages)) {
			return {
				...campaignMessages,
				trace: [
					...campaignMessages.trace,
					'CampaignAnalyticsService - getCampaignAnalytics - this.campaignMessagesService.getCampaignMessages',
				],
			};
		}

		const campaign = await this.campaignDataService.getCampaign(campaignId || campaignMessages.campaignId);
		if (isError(campaign)) {
			return {
				...campaign,
				trace: [
					...campaign.trace,
					'CampaignAnalyticsService - getCampaignAnalytics - this.campaignDataService.getCampaign',
				],
			};
		}

		const workflow = await this.workflowPrivateService.getWorkflowInternal(campaignMessages.workflowId);
		if (isError(workflow)) {
			return {
				...workflow,
				trace: [
					...workflow.trace,
					'CampaignAnalyticsService - getCampaignAnalytics - this.workflowPrivateService.getWorkflowInternal',
				],
			};
		}

		return {
			campaign: {
				id: campaign.id,
				campaignName: campaign.campaignName,
				created: campaign.created,
				templateName: campaign.templateName,
				type: campaign.type,
			},
			workflow: {
				id: campaignMessages.workflowId,
				title: workflow.title,
				status: workflow.status,
			},
			...this.processCampaignAnalytics(campaignMessages),
		};
	}

	/**
	 * Get user campaigns
	 */
	async getUserCampaignsAnalytics(userId: string): Promise<DefaultReturnType<CampaignAnalyticsType[]>> {
		const campaigns = await this.campaignDataService.getUserCampaigns(userId);
		if (isError(campaigns)) return [];

		const processedCampaigns: CampaignAnalyticsType[] = [];
		for (const campaign of campaigns) {
			const campaignMessages = await this.campaignMessagesService.getCampaignMessages({
				campaignId: campaign.id,
			});
			if (isError(campaignMessages)) {
				return {
					...campaignMessages,
					trace: [
						...campaignMessages.trace,
						'CampaignAnalyticsService - getUserCampaignsAnalytics - this.campaignMessagesService.getCampaignMessages',
					],
				};
			}

			const workflow = await this.workflowPrivateService.getWorkflowInternal(campaignMessages.workflowId);
			if (isError(workflow)) {
				return {
					...workflow,
					trace: [
						...workflow.trace,
						'CampaignAnalyticsService - getUserCampaignsAnalytics - this.workflowPrivateService.getWorkflowInternal',
					],
				};
			}

			processedCampaigns.push({
				campaign: {
					id: campaign.id,
					campaignName: campaign.campaignName,
					created: campaign.created,
					templateName: campaign.templateName,
					type: campaign.type,
				},
				workflow: {
					id: campaignMessages.workflowId,
					title: workflow.title,
					status: workflow.status,
				},
				...this.processCampaignAnalytics(campaignMessages),
			});
		}

		return processedCampaigns;
	}

	/**
	 * Get campaign analytics
	 */
	private processCampaignAnalytics(campaignMessages: CampaignMessagesType): {
		messages: CampaignAnalyticsType['messages'];
		responses: CampaignAnalyticsType['responses'];
	} {
		const messagesSent = campaignMessages.messages.reduce(
			(acc, message) => acc + message.content.filter((content) => content.status !== 'failed').length,
			0,
		);
		const messagesFailed = campaignMessages.messages.reduce(
			(acc, message) => acc + message.content.filter((content) => content.status === 'failed').length,
			0,
		);
		const messagesReceived = campaignMessages.messages.reduce(
			(acc, message) => acc + message.content.filter((content) => content.status === 'received').length,
			0,
		);
		const messagesUnread = campaignMessages.messages.reduce(
			(acc, message) => acc + message.content.filter((content) => content.status === 'unread').length,
			0,
		);

		const reach = campaignMessages.messages.length;
		const responsePercentage = messagesSent > 0 ? (messagesReceived * 100) / messagesSent : 0;

		const allMessages = campaignMessages.messages.flatMap((message) => message.content);

		const messageStartTimestamp = campaignMessages.messages[0].content[0].timestamp;
		const messageStart = new Date(messageStartTimestamp);
		const messageStartDay = messageStart.getDate();
		const messageStartMonth = messageStart.getMonth();
		const messageStartYear = messageStart.getFullYear();

		const messageEndTimestamp =
			campaignMessages.messages[campaignMessages.messages.length - 1].content[0].timestamp;

		const startDateTimestamp = new Date(messageStartYear, messageStartMonth, messageStartDay).getTime();

		const responses: { date: number; month: number; year: number; responseCount: number }[] = [];

		let currentTimeStamp = startDateTimestamp;

		while (currentTimeStamp < messageEndTimestamp) {
			const currentDateEndTimestamp = currentTimeStamp + TIME.DAY_IN_MS;

			const thisDayMessages = allMessages.filter((message) => {
				const messageTimestamp = message.timestamp;
				return messageTimestamp >= currentTimeStamp && messageTimestamp < currentDateEndTimestamp;
			});

			const currentFullDate = new Date(currentTimeStamp);

			responses.push({
				date: currentFullDate.getUTCDate(),
				month: currentFullDate.getUTCMonth(),
				year: currentFullDate.getUTCFullYear(),
				responseCount: thisDayMessages.length,
			});

			currentTimeStamp = currentDateEndTimestamp;
		}

		return {
			messages: {
				messagesSent,
				messagesReceived,
				messagesFailed,
				messagesUnread,
				reach,
				responsePercentage,
			},
			responses,
		};
	}
}
