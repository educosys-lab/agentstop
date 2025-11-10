import { WorkflowStatusType } from 'src/workflow/workflow.type';
import { CampaignType } from '../campaign-data/campaign.type';

export type CampaignAnalyticsType = {
	campaign: {
		id: string;
		campaignName: string;
		created: number;
		templateName: string;
		type: CampaignType;
	};
	messages: {
		messagesSent: number;
		messagesReceived: number;
		messagesFailed: number;
		messagesUnread: number;
		reach: number;
		responsePercentage: number;
	};
	responses: {
		date: number;
		month: number;
		year: number;
		responseCount: number;
	}[];
	workflow: {
		id: string;
		title: string;
		status: WorkflowStatusType;
	};
};
