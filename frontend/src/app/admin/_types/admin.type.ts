import { LucideIconType } from '@/types/lucide.type';

export type User = {
	id: string;
	name: string;
	email: string;
	role: string;
	status: string;
	plan: string;
	joined: string;
};

export type Workflow = {
	id: string;
	name: string;
	status: string;
	executions: number;
	errors: number;
	lastRun: string;
};

export type Announcement = {
	id: string;
	title: string;
	type: string;
	audience: string;
	date: string;
	status: string;
};

export type AdminRole = {
	id: string;
	name: string;
	permissions: string;
	users: number;
};

export type Metric = {
	dau: number;
	mau: number;
	totalUsers: number;
	activeWorkflows: number;
	totalExecutions: number;
	churnRate: string;
	mrr: number;
	arr: number;
	serverUptime: string;
	apiLatency: string;
	errorRate: string;
	trialConversions: string;
	planUpgrades: number;
	infraHealth: string;
};

export type ModalType =
	| 'addPaymentGateway'
	| 'editPaymentGateway'
	| 'themeCustomization'
	| 'banUser'
	| 'refundPayment'
	| 'extendTrial'
	| 'extendTrialMarketing'
	| 'applyDiscount'
	| 'createAnnouncement'
	| 'editAnnouncement'
	| 'editUser'
	| 'createWorkflow'
	| 'editWorkflow'
	| 'editServerSettings'
	| 'manageBackups'
	| 'configureAlerts'
	| 'apiConfigs'
	| 'addGateway'
	| 'editStripe'
	| 'editPaypal'
	| 'createRole'
	| 'editRole'
	| 'manageEncryption'
	| 'createSegment'
	| 'editProfile'
	| 'notificationSettings'
	| 'themeSettings'
	| 'editThresholds'
	| 'addUser';

export type ModalContent = {
	modalId: string;
	title: string;
	type: ModalType | null;
	modalWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | 'auto';
	modalDescription?: string;
};

export type FormData = Record<string, any>;

export type NavItem = {
	name: string;
	icon: LucideIconType;
};

export type RoleConfig = {
	icon: LucideIconType;
	nav: NavItem[];
};
