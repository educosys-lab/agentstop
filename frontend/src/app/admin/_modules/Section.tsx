import { ReactNode } from 'react';

type SectionProps = {
	title: string;
	children: ReactNode;
	actions?: ReactNode;
};

export const Section = ({ title, children, actions }: SectionProps) => (
	<div className="mb-6 rounded-lg bg-slate-800 p-6 shadow-lg">
		<div className="mb-4 flex items-center justify-between">
			<h2 className="text-xl font-semibold text-slate-100">{title}</h2>
			{actions && <div className="flex space-x-2">{actions}</div>}
		</div>
		<div>{children}</div>
	</div>
);
