import { LineChart, PieChart, Line, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

import { COLORS } from '@/app/workflow/_data/colors.data';
import { mockWorkflowData } from '@/app/workflow/_data/workflow.data';

export type GraphPropsType = {};

export default function Graph({}: GraphPropsType) {
	return (
		<div className="mb-12 grid grid-cols-1 gap-8 lg:grid-cols-2">
			<div className="rounded-xl border border-border bg-gray-800/50 p-6">
				<h2 className="mb-4 text-xl font-semibold">Run Distribution</h2>

				<PieChart width={400} height={300}>
					<Pie
						data={[
							{ name: 'Success', value: mockWorkflowData.successRate },
							{ name: 'Errors', value: mockWorkflowData.errorRate },
						]}
						cx="50%"
						cy="50%"
						innerRadius={60}
						outerRadius={80}
						paddingAngle={5}
						dataKey="value"
					>
						{[COLORS[0], COLORS[1]].map((color, index) => (
							<Cell key={`cell-${index}`} fill={color} />
						))}
					</Pie>
					<Tooltip />
					<Legend />
				</PieChart>
			</div>

			<div className="rounded-xl border border-border bg-gray-800/50 p-6">
				<h2 className="mb-4 text-xl font-semibold">Usage Trend</h2>

				<LineChart width={500} height={300} data={mockWorkflowData.usageData} className="!w-full">
					<CartesianGrid strokeDasharray="3 3" stroke="#374151" />
					<XAxis dataKey="date" stroke="#9CA3AF" />
					<YAxis stroke="#9CA3AF" />
					<Tooltip />
					<Line type="monotone" dataKey="runs" stroke={COLORS[0]} strokeWidth={2} />
				</LineChart>
			</div>
		</div>
	);
}
