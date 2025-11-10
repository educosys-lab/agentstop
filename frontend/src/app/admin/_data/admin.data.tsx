import {
	ShieldIcon,
	LayoutDashboardIcon,
	BarChart3Icon,
	UsersIcon,
	SlidersHorizontalIcon,
	DollarSignIcon,
	Volume2Icon,
	ServerIcon,
	BriefcaseIcon,
	UserCogIcon,
	FileUpIcon,
	SettingsIcon,
	TargetIcon,
	MailIcon,
} from 'lucide-react';

import { AdminRole, Announcement, Metric, RoleConfig, User, Workflow } from '../_types/admin.type';

export const matrixData: Metric = {
	dau: 1250,
	mau: 15800,
	totalUsers: 55200,
	activeWorkflows: 750,
	totalExecutions: 120500,
	churnRate: '2.5%',
	mrr: 55000,
	arr: 660000,
	serverUptime: '99.98%',
	apiLatency: '120ms',
	errorRate: '0.5%',
	trialConversions: '15%',
	planUpgrades: 85,
	infraHealth: 'Optimal',
};

export const userData: User[] = [
	{
		id: 'usr_001',
		name: 'Alice Wonderland',
		email: 'alice@example.com',
		role: 'User',
		status: 'Active',
		plan: 'Pro',
		joined: '2023-01-15',
	},
	{
		id: 'usr_002',
		name: 'Bob The Builder',
		email: 'bob@example.com',
		role: 'User',
		status: 'Inactive',
		plan: 'Free',
		joined: '2023-02-20',
	},
	{
		id: 'usr_003',
		name: 'Charlie Chaplin',
		email: 'charlie@example.com',
		role: 'Admin',
		status: 'Active',
		plan: 'Enterprise',
		joined: '2022-11-05',
	},
	{
		id: 'usr_004',
		name: 'Diana Prince',
		email: 'diana@example.com',
		role: 'User',
		status: 'Active',
		plan: 'Pro',
		joined: '2023-03-10',
	},
	{
		id: 'usr_005',
		name: 'Edward Scissorhands',
		email: 'edward@example.com',
		role: 'User',
		status: 'Banned',
		plan: 'Free',
		joined: '2023-04-01',
	},
];

export const workflowsData: Workflow[] = [
	{
		id: 'wf_001',
		name: 'User Onboarding',
		status: 'Active',
		executions: 1200,
		errors: 5,
		lastRun: '2024-05-25 10:00 UTC',
	},
	{
		id: 'wf_002',
		name: 'Payment Processing',
		status: 'Active',
		executions: 850,
		errors: 1,
		lastRun: '2024-05-26 09:30 UTC',
	},
	{
		id: 'wf_003',
		name: 'Data Backup',
		status: 'Paused',
		executions: 300,
		errors: 0,
		lastRun: '2024-05-20 02:00 UTC',
	},
	{
		id: 'wf_004',
		name: 'Reporting Generation',
		status: 'Error',
		executions: 50,
		errors: 12,
		lastRun: '2024-05-24 17:00 UTC',
	},
];

export const announcementData: Announcement[] = [
	{
		id: 'ann_001',
		title: 'New Feature: AI Insights',
		type: 'In-App',
		audience: 'All Users',
		date: '2024-05-20',
		status: 'Published',
	},
	{
		id: 'ann_002',
		title: 'Scheduled Maintenance',
		type: 'Email',
		audience: 'Pro Tier Users',
		date: '2024-05-15',
		status: 'Sent',
	},
	{
		id: 'ann_003',
		title: 'Summer Discount Offer',
		type: 'Email & In-App',
		audience: 'Free Tier Users',
		date: '2024-06-01',
		status: 'Scheduled',
	},
];

export const adminRolesData: AdminRole[] = [
	{ id: 'role_001', name: 'Super Admin', permissions: 'Full Access', users: 1 },
	{ id: 'role_002', name: 'Dev-Admin', permissions: 'Infrastructure & Workflows', users: 3 },
	{ id: 'role_003', name: 'Marketing/Sales Admin', permissions: 'Marketing & User Engagement', users: 2 },
	{ id: 'role_004', name: 'Support Agent', permissions: 'View User Data, Basic Actions', users: 5 },
];

export const rolesConfigData: Record<string, RoleConfig> = {
	'Super Admin': {
		icon: ShieldIcon,
		nav: [
			{ name: 'Dashboard', icon: LayoutDashboardIcon },
			{ name: 'Metrics & Analytics', icon: BarChart3Icon },
			{ name: 'User Management', icon: UsersIcon },
			{ name: 'Workflow Management', icon: SlidersHorizontalIcon },
			{ name: 'Financials', icon: DollarSignIcon },
			{ name: 'Announcements', icon: Volume2Icon },
			{ name: 'Infrastructure', icon: ServerIcon },
			{ name: 'Payment Gateways', icon: BriefcaseIcon },
			{ name: 'Role Management', icon: UserCogIcon },
			{ name: 'Data Export', icon: FileUpIcon },
			{ name: 'Settings', icon: SettingsIcon },
		],
	},
	'Dev-Admin': {
		icon: ServerIcon,
		nav: [
			{ name: 'Dashboard', icon: LayoutDashboardIcon },
			{ name: 'Infrastructure Metrics', icon: BarChart3Icon },
			{ name: 'Infrastructure Status', icon: ServerIcon },
			{ name: 'Security Audits', icon: ShieldIcon },
			{ name: 'Data Export (Logs)', icon: FileUpIcon },
			{ name: 'Settings', icon: SettingsIcon },
		],
	},
	'Marketing/Sales Admin': {
		icon: TargetIcon,
		nav: [
			{ name: 'Dashboard', icon: LayoutDashboardIcon },
			{ name: 'User Growth Metrics', icon: BarChart3Icon },
			{ name: 'Business Metrics', icon: DollarSignIcon },
			{ name: 'Campaigns', icon: MailIcon },
			{ name: 'User Segments', icon: UsersIcon },
			{ name: 'Data Export (Users)', icon: FileUpIcon },
			{ name: 'Settings', icon: SettingsIcon },
		],
	},
};
