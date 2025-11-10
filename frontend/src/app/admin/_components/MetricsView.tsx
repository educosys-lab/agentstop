import { BarChart3Icon, SettingsIcon, TargetIcon, UsersIcon } from 'lucide-react';

import { ModalType } from '../_types/admin.type';

import { Section } from '../_modules/Section';
import { Button } from '../../../components/ui/button';
import { MetricCard } from '../_modules/MetricCard';
import { PlaceholderChart } from '../_modules/PlaceholderChart';

type MetricsViewProps = {
	currentView: string;
	commonActions: { key: string; icon: string; label: string; onClick: () => void }[];
	openModal: (title: string, type: ModalType, modalId: string, initialData?: FormData) => void;
	currentRole: string;
};

export const MetricsView = ({ currentView, commonActions, openModal, currentRole }: MetricsViewProps) => {
	return (
		<Section
			title={currentView}
			actions={commonActions.map((action) => (
				<Button key={action.key} className="py-5" variant="outline" size="sm" onClick={action.onClick}>
					{action.label}
				</Button>
			))}
		>
			<p className="mb-6 text-slate-400">
				Detailed metrics and reporting for {currentView.toLowerCase()}. Customize dashboards and set alert
				thresholds.
			</p>
			<div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
				<PlaceholderChart />
				<PlaceholderChart />
			</div>
			<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
				<MetricCard title="Key Metric 1" value="1,234" icon={<BarChart3Icon />} />
				<MetricCard title="Key Metric 2" value="87%" icon={<TargetIcon />} />
				<MetricCard title="Key Metric 3" value="5.6k" icon={<UsersIcon />} />
				{currentRole === 'Super Admin' && (
					<Button
						onClick={() => openModal('Edit Metric Thresholds', 'editThresholds', 'edit-thresholds-modal')}
					>
						<SettingsIcon className="mr-2 size-5" />
						Edit Thresholds
					</Button>
				)}
			</div>
		</Section>
	);
};
