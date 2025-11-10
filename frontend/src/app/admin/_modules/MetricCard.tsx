import { ReactNode } from 'react';

type MetricCardProps = {
	title: string;
	value: string | number;
	icon: ReactNode;
	trend?: string;
	color?: string;
};

export const MetricCard = ({ title, value, icon, trend, color = 'bg-slate-800' }: MetricCardProps) => (
	<div className={`${color} rounded-lg p-5 shadow-lg transition-shadow duration-300 hover:shadow-indigo-500/30`}>
		<div className="flex items-center justify-between">
			<p className="text-sm text-slate-400">{title}</p>
			<div>{icon}</div>
		</div>
		<h2 className="text-2xl font-bold text-white">{value}</h2>
		{trend && <p className="text-sm text-green-500">{trend}</p>}
	</div>
);
