import { FiActivity, FiClock, FiDollarSign, FiUser } from 'react-icons/fi';

import { mockWorkflowData } from '@/app/workflow/_data/workflow.data';

export type QuickStatsPropsType = {};

export default function QuickStats({}: QuickStatsPropsType) {
	return (
		<div className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
			<div className="rounded-xl border border-border bg-gray-800/50 p-6">
				<FiClock className="mb-2 text-2xl text-primary-light" />
				<h3 className="mb-1 text-muted">Created</h3>
				<p className="text-xl font-semibold">{mockWorkflowData.created}</p>
			</div>

			<div className="rounded-xl border border-border bg-gray-800/50 p-6">
				<FiActivity className="mb-2 text-2xl text-primary-dark" />
				<h3 className="mb-1 text-muted">Total Runs</h3>
				<p className="text-xl font-semibold">{mockWorkflowData.totalRuns}</p>
			</div>

			<div className="rounded-xl border border-border bg-gray-800/50 p-6">
				<FiUser className="mb-2 text-2xl text-success" />
				<h3 className="mb-1 text-muted">Active Users</h3>
				<p className="text-xl font-semibold">{mockWorkflowData.users}</p>
			</div>

			<div className="rounded-xl border border-border bg-gray-800/50 p-6">
				<FiDollarSign className="mb-2 text-2xl text-warn" />
				<h3 className="mb-1 text-muted">Total Revenue</h3>
				<p className="text-xl font-semibold">${mockWorkflowData.revenue.toFixed(2)}</p>
			</div>
		</div>
	);
}
