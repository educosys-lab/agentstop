import { BellIcon, DatabaseIcon, SettingsIcon, SlidersHorizontalIcon } from 'lucide-react';

import { ModalType } from '../_types/admin.type';

import { Section } from '../_modules/Section';
import { Button } from '../../../components/ui/button';

type InfrastructureViewProps = {
	currentView: string;
	commonActions: { key: string; icon: string; label: string; onClick: () => void }[];
	openModal: (title: string, type: ModalType, modalId: string, initialData?: FormData) => void;
};

export const InfrastructureView = ({ currentView, commonActions, openModal }: InfrastructureViewProps) => {
	return (
		<Section
			title={currentView}
			actions={commonActions.map((action) => (
				<Button key={action.key} variant="outline" size="sm" onClick={action.onClick} className="py-5">
					{action.label}
				</Button>
			))}
		>
			<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
				<div className="rounded-lg bg-slate-700 p-4 shadow">
					<h3 className="mb-2 text-lg font-medium text-slate-200">Server Settings</h3>
					<p className="mb-4 text-sm text-slate-400">
						Configure server parameters, view logs, manage resources.
					</p>
					<Button
						onClick={() =>
							openModal('Edit Server Settings', 'editServerSettings', 'edit-server-settings-modal')
						}
						variant="primary"
						size="sm"
					>
						<SettingsIcon className="mr-2 size-5" />
						Edit Settings
					</Button>
				</div>
				<div className="rounded-lg bg-slate-700 p-4 shadow">
					<h3 className="mb-2 text-lg font-medium text-slate-200">Backup Management</h3>
					<p className="mb-4 text-sm text-slate-400">
						View backup history, schedule new backups, restore from backup.
					</p>
					<Button
						onClick={() => openModal('Manage Backups', 'manageBackups', 'manage-backups-modal')}
						variant="primary"
						size="sm"
					>
						<DatabaseIcon className="mr-2 size-5" />
						Manage Backups
					</Button>
				</div>
				<div className="rounded-lg bg-slate-700 p-4 shadow">
					<h3 className="mb-2 text-lg font-medium text-slate-200">Alert Configuration</h3>
					<p className="mb-4 text-sm text-slate-400">
						Set up alerts for downtime, resource thresholds, security events.
					</p>
					<Button
						onClick={() => openModal('Configure Alerts', 'configureAlerts', 'configure-alerts-modal')}
						variant="primary"
						size="sm"
					>
						<BellIcon className="mr-2 size-5" />
						Configure Alerts
					</Button>
				</div>
				<div className="rounded-lg bg-slate-700 p-4 shadow">
					<h3 className="mb-2 text-lg font-medium text-slate-200">API Configurations</h3>
					<p className="mb-4 text-sm text-slate-400">Manage API keys, rate limits, and endpoint settings.</p>
					<Button
						variant="primary"
						size="sm"
						onClick={() => openModal('API Configurations', 'apiConfigs', 'api-configs-modal')}
					>
						<SlidersHorizontalIcon className="mr-2 size-5" />
						Manage APIs
					</Button>
				</div>
			</div>
		</Section>
	);
};
