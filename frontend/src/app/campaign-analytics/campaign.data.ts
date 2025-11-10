export const analyticsDummyData = {
	campaign: {
		id: '1',
		campaignName: 'Campaign 1',
		created: 1724169600,
		templateName: 'Template 1',
		type: 'whatsapp' as const,
	},
	messages: {
		messagesSent: 100,
		messagesReceived: 50,
		messagesFailed: 30,
		messagesUnread: 20,
		reach: 100,
		responsePercentage: 50,
	},
	responses: [
		{ date: 1, month: 0, year: 2025, responseCount: 50 },
		{ date: 2, month: 1, year: 2025, responseCount: 75 },
		{ date: 3, month: 2, year: 2025, responseCount: 45 },
		{ date: 4, month: 3, year: 2025, responseCount: 50 },
		{ date: 5, month: 4, year: 2025, responseCount: 90 },
		{ date: 6, month: 5, year: 2025, responseCount: 60 },
	],
	workflow: {
		id: '1',
		title: 'Workflow 1',
		status: 'live' as const,
	},
};
