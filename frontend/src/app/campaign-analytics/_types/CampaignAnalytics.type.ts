import { WorkflowStatusType } from '@/app/workflow/_types/workflow.type';

export const CAMPAIGN_TYPE = ['whatsapp'] as const;
export type CampaignType = (typeof CAMPAIGN_TYPE)[number];

export const MESSAGE_STATUS = ['sent', 'read', 'unread', 'delivered', 'received'] as const;
export type MessageStatusType = (typeof MESSAGE_STATUS)[number];

export type CampaignDataType = {
	id: string;
	userId: string;
	campaignName: string;
	created: number;
	templateName: string;
	type: CampaignType;
};

export type CampaignMessagesType = {
	campaignId: string;
	userId: string;
	workflowId: string;
	nodeId: string;
	messages: {
		receiverMobile: string;
		content: {
			messageId: string;
			messageContent: string;
			timestamp: number;
			status: MessageStatusType;
		}[];
	}[];
};

export type CampaignAnalyticsType = {
	// Campaign
	campaign: {
		id: string;
		campaignName: string;
		created: number;
		templateName: string;
		type: CampaignType;
	};
	// Messages
	messages: {
		messagesSent: number;
		messagesReceived: number;
		messagesFailed: number;
		messagesUnread: number;
		reach: number;
		responsePercentage: number;
	};
	// Daily Response
	responses: {
		date: number;
		month: number;
		year: number;
		responseCount: number;
	}[];
	// Mission
	workflow: {
		id: string;
		title: string;
		status: WorkflowStatusType;
	};
};
