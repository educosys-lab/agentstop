export const MESSAGE_STATUS = ['sent', 'read', 'unread', 'delivered', 'failed', 'received'] as const;
export type MessageStatusType = (typeof MESSAGE_STATUS)[number];

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
