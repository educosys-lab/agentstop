import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

import { COLORS } from '@/app/workflow/_data/colors.data';
import { mockWorkflowData } from '@/app/workflow/_data/workflow.data';

export type RevenuePropsType = {};

export default function Revenue({}: RevenuePropsType) {
	return (
		<div className="mt-8 rounded-xl border border-border bg-gray-800/50 p-6">
			<h2 className="mb-4 text-xl font-semibold">Revenue Overview</h2>

			<BarChart width={800} height={300} data={mockWorkflowData.revenueData}>
				<CartesianGrid strokeDasharray="3 3" stroke="#374151" />
				<XAxis dataKey="month" stroke="#9CA3AF" />
				<YAxis stroke="#9CA3AF" />
				<Tooltip />
				<Bar dataKey="amount" fill={COLORS[3]} radius={[4, 4, 0, 0]} />
			</BarChart>
		</div>
	);
}
