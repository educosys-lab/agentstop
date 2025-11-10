export type WhatsAppMessageType = {
	id: string;
	content: string;
	time: string;
	isMine: boolean;
	status?: 'sent' | 'delivered' | 'read' | 'unread';
	timestamp: number;
	campaignId: string;
};

export type WhatsAppContactType = {
	id: string;
	name: string;
	phone: string;
	avatar?: string;
	lastSeen: string;
	lastMessage?: string;
	lastMessageTime: string;
	unreadCount: number;
	messages: WhatsAppMessageType[];
	campaignId?: string;
	workflowId: string;
    nodeId: string;
};
