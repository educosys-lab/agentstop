import {
	BarChart3Icon,
	BellIcon,
	DatabaseIcon,
	DollarSignIcon,
	MailIcon,
	MilestoneIcon,
	PercentIcon,
	PowerIcon,
	ServerIcon,
	SettingsIcon,
	ShieldIcon,
	SlidersHorizontalIcon,
	TargetIcon,
	UsersIcon,
	Volume2Icon,
} from 'lucide-react';

import { Metric, ModalType } from '../_types/admin.type';

import { Section } from '../_modules/Section';
import { Button } from '../../../components/ui/button';
import { MetricCard } from '../_modules/MetricCard';
import { PlaceholderChart } from '../_modules/PlaceholderChart';

type DashboardViewProps = {
	currentRole: string;
	metrics: Metric;
	openModal: (title: string, type: ModalType, modalId: string, initialData?: FormData) => void;
	setCurrentView: (view: string) => void;
};

export const DashboardView = ({ currentRole, metrics, openModal, setCurrentView }: DashboardViewProps) => {
	return (
		<>
			<Section
				title="Overview"
				actions={[
					<Button key="refresh" size="sm">
						<PowerIcon className="mr-2 size-5" />
						Refresh Data
					</Button>,
				]}
			>
				<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
					{currentRole === 'Super Admin' && (
						<>
							<MetricCard
								title="Daily Active Users"
								value={metrics.dau}
								icon={<UsersIcon />}
								trend="+5%"
							/>
							<MetricCard
								title="Monthly Active Users"
								value={metrics.mau}
								icon={<UsersIcon />}
								trend="+2%"
							/>
							<MetricCard title="Total Users" value={metrics.totalUsers} icon={<UsersIcon />} />
							<MetricCard
								title="Active Workflows"
								value={metrics.activeWorkflows}
								icon={<SlidersHorizontalIcon />}
							/>
							<MetricCard
								title="Total Executions"
								value={metrics.totalExecutions}
								icon={<MilestoneIcon />}
							/>
							<MetricCard
								title="Churn Rate"
								value={metrics.churnRate}
								icon={<PercentIcon />}
								color="bg-red-700"
								trend="-0.2%"
							/>
							<MetricCard
								title="MRR"
								value={`$${metrics.mrr.toLocaleString('en-US')}`}
								icon={<DollarSignIcon />}
								trend="+$2k"
							/>
							<MetricCard
								title="ARR"
								value={`$${metrics.arr.toLocaleString('en-US')}`}
								icon={<DollarSignIcon />}
								trend="+$24k"
							/>
							<MetricCard
								title="Infrastructure Health"
								value={metrics.infraHealth}
								icon={<ServerIcon />}
								color={metrics.infraHealth === 'Optimal' ? 'bg-green-700' : 'bg-yellow-600'}
							/>
						</>
					)}
					{currentRole === 'Dev-Admin' && (
						<>
							<MetricCard title="Server Uptime" value={metrics.serverUptime} icon={<ServerIcon />} />
							<MetricCard
								title="API Latency"
								value={metrics.apiLatency}
								icon={<SlidersHorizontalIcon />}
							/>
							<MetricCard
								title="Error Rate"
								value={metrics.errorRate}
								icon={<ShieldIcon />}
								color="bg-yellow-600"
							/>
							<MetricCard
								title="Active Workflows"
								value={metrics.activeWorkflows}
								icon={<SlidersHorizontalIcon />}
							/>
							<MetricCard
								title="Workflow Executions (24h)"
								value={Math.floor(metrics.totalExecutions / 30)}
								icon={<MilestoneIcon />}
							/>
						</>
					)}
					{currentRole === 'Marketing/Sales Admin' && (
						<>
							<MetricCard
								title="Daily Active Users"
								value={metrics.dau}
								icon={<UsersIcon />}
								trend="+5%"
							/>
							<MetricCard
								title="Monthly Active Users"
								value={metrics.mau}
								icon={<UsersIcon />}
								trend="+2%"
							/>
							<MetricCard title="Total Signups" value={metrics.totalUsers} icon={<UsersIcon />} />
							<MetricCard
								title="Churn Rate"
								value={metrics.churnRate}
								icon={<PercentIcon />}
								color="bg-red-700"
								trend="-0.2%"
							/>
							<MetricCard
								title="MRR"
								value={`$${metrics.mrr.toLocaleString('en-US')}`}
								icon={<DollarSignIcon />}
								trend="+$2k"
							/>
							<MetricCard
								title="Trial Conversions"
								value={metrics.trialConversions}
								icon={<TargetIcon />}
							/>
							<MetricCard
								title="Plan Upgrades (Month)"
								value={metrics.planUpgrades}
								icon={<BarChart3Icon />}
							/>
						</>
					)}
				</div>
			</Section>
			<Section title="Quick Actions">
				<div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
					{currentRole === 'Super Admin' && (
						<>
							<Button
								className="w-full"
								onClick={() => openModal('Ban User', 'banUser', 'ban-user-modal')}
							>
								<UsersIcon className="mr-2 size-5" />
								Ban User
							</Button>
							<Button
								onClick={() => openModal('Refund Payment', 'refundPayment', 'refund-payment-modal')}
								className="w-full"
							>
								<DollarSignIcon className="mr-2 size-5" />
								Refund Payment
							</Button>
							<Button className="w-full">
								<PowerIcon className="mr-2 size-5" />
								Pause Workflows
							</Button>
							<Button className="w-full">
								<MilestoneIcon className="mr-2 size-5" />
								Trigger Execution
							</Button>
							<Button
								onClick={() => openModal('Extend Trial', 'extendTrial', 'extend-trial-modal')}
								className="w-full"
							>
								<BellIcon className="mr-2 size-5" />
								Extend Trial
							</Button>
						</>
					)}
					{currentRole === 'Dev-Admin' && (
						<>
							<Button className="w-full">
								<PowerIcon className="mr-2 size-5" />
								Pause Workflow
							</Button>
							<Button className="w-full">
								<MilestoneIcon className="mr-2 size-5" />
								Trigger Execution
							</Button>
							<Button className="w-full">
								<DatabaseIcon className="mr-2 size-5" />
								Restore Backup
							</Button>
							<Button className="w-full">
								<SettingsIcon className="mr-2 size-5" />
								Configure Alert
							</Button>
						</>
					)}
					{currentRole === 'Marketing/Sales Admin' && (
						<>
							<Button
								className="w-full"
								onClick={() =>
									openModal(
										'Extend Free Trial',
										'extendTrialMarketing',
										'extend-trial-marketing-modal',
									)
								}
							>
								<BellIcon className="mr-2 size-5" />
								Extend Free Trial
							</Button>
							<Button className="w-full">
								<MailIcon className="mr-2 size-5" />
								Send Reminders
							</Button>
							<Button
								className="w-full"
								onClick={() => openModal('Apply Discount', 'applyDiscount', 'apply-discount-modal')}
							>
								<PercentIcon className="mr-2 size-5" />
								Apply Discount
							</Button>
							<Button className="w-full" onClick={() => setCurrentView('Campaigns')}>
								<Volume2Icon className="mr-2 size-5" />
								Create Campaign
							</Button>
						</>
					)}
				</div>
			</Section>
			<Section title="Recent Activity">
				<PlaceholderChart />
			</Section>
		</>
	);
};
