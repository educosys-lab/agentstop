export const mockWorkflowData = {
	id: '1',
	name: 'Customer Onboarding Automation',
	created: '2024-03-15',
	modified: '2024-03-20',
	totalRuns: 142,
	successRate: 85,
	errorRate: 15,
	users: 45,
	revenue: 2245.5,
	executions: [
		{ id: 1, timestamp: '2024-03-20 14:30', status: 'success', duration: '2.4s' },
		{ id: 2, timestamp: '2024-03-20 14:25', status: 'error', duration: '1.8s' },
	],
	usageData: [
		{ date: 'Mar 1', runs: 12 },
		{ date: 'Mar 5', runs: 18 },
	],
	revenueData: [
		{ month: 'Jan', amount: 450 },
		{ month: 'Feb', amount: 890 },
	],
};
