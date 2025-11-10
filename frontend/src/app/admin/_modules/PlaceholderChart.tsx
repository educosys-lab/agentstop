import { BarChart } from 'lucide-react';

type PlaceholderChartProps = {
	height?: string;
};

export const PlaceholderChart = ({ height = 'h-64' }: PlaceholderChartProps) => (
	<div
		className={`w-full ${height} flex items-center justify-center rounded-md border border-slate-700 bg-slate-700/50 text-slate-500`}
	>
		<BarChart />
		<span className="ml-2">Chart Placeholder</span>
	</div>
);
