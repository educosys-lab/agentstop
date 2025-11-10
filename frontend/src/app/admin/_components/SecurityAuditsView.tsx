import { LockIcon, ShieldIcon } from 'lucide-react';

import { ModalType } from '../_types/admin.type';

import { Section } from '../_modules/Section';
import { Button } from '../../../components/ui/button';

type SecurityAuditsViewProps = {
	commonActions: { key: string; icon: string; label: string; onClick: () => void }[];
	openModal: (title: string, type: ModalType, modalId: string, initialData?: FormData) => void;
};

export const SecurityAuditsView = ({ commonActions, openModal }: SecurityAuditsViewProps) => {
	return (
		<Section
			title="Security Audits"
			actions={commonActions.map((action) => (
				<Button key={action.key} variant="outline" size="sm" onClick={action.onClick} className="py-5">
					{action.label}
				</Button>
			))}
		>
			<h3 className="mb-2 text-lg font-medium text-slate-400">
				Manage encryption settings and audit mission security (e.g., risky API integrations).
			</h3>
			<div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2">
				<div className="rounded-lg bg-slate-700 p-4 shadow">
					<h3 className="mb-2 text-lg font-medium text-slate-200">Encryption Settings</h3>
					<p className="mb-4 text-sm text-slate-400">Current: AES-256. Last Key Rotation: 2024-03-01</p>
					<Button
						onClick={() => openModal('Manage Encryption', 'manageEncryption', 'manage-encryption-modal')}
						variant="primary"
						size="sm"
					>
						<LockIcon className="mr-2 size-5" />
						Manage Encryption
					</Button>
				</div>
				<div className="rounded-lg bg-slate-700 p-4 shadow">
					<h3 className="mb-2 text-lg font-medium text-slate-200">Workflow Security Scans</h3>
					<p className="mb-4 text-sm text-slate-400">Last Scan: 2024-05-20. Issues Found: 2 (Medium)</p>
					<Button variant="primary" size="sm">
						<ShieldIcon className="mr-2 size-5" />
						Run Scan
					</Button>
				</div>
			</div>
		</Section>
	);
};
