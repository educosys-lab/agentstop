import { DownloadIcon } from 'lucide-react';

import { Section } from '../_modules/Section';
import { Button } from '../../../components/ui/button';

type DataExportViewProps = {
	currentRole: string;
	commonActions: { key: string; icon: string; label: string; onClick: () => void }[];
};

export const DataExportView = ({ currentRole, commonActions }: DataExportViewProps) => {
	return (
		<Section
			title="Data Export"
			actions={commonActions.map((action) => (
				<Button key={action.key} variant="outline" size="sm" onClick={action.onClick} className="py-5">
					{action.label}
				</Button>
			))}
		>
			<h3 className="mb-2 text-lg font-medium text-slate-400">
				Select data types to export. Exports will be generated in CSV/JSON format.
			</h3>
			<div className="grid grid-cols-3 gap-3">
				{currentRole === 'Super Admin' && (
					<>
						<Button size="sm" className="w-full py-3">
							<DownloadIcon className="mr-2 size-5" />
							Export All User Data
						</Button>
						<Button size="sm" className="w-full py-3">
							<DownloadIcon className="mr-2 size-5" />
							Export All Workflow Data
						</Button>
						<Button size="sm" className="w-full py-3">
							<DownloadIcon className="mr-2 size-5" />
							Export Financial Records
						</Button>
						<Button size="sm" className="w-full py-3">
							<DownloadIcon className="mr-2 size-5" />
							Export Audit Logs
						</Button>
						<Button size="sm" className="w-full py-3">
							<DownloadIcon className="mr-2 size-5" />
							Export System Configurations
						</Button>
					</>
				)}
				{currentRole === 'Dev-Admin' && (
					<>
						<Button size="sm" className="w-full py-3">
							<DownloadIcon className="mr-2 size-5" />
							Workflow Metadata
						</Button>
						<Button size="sm" className="w-full py-3">
							<DownloadIcon className="mr-2 size-5" />
							Execution Logs
						</Button>
						<Button size="sm" className="w-full py-3">
							<DownloadIcon className="mr-2 size-5" />
							Infrastructure Logs
						</Button>
						<Button size="sm" className="w-full py-3">
							<DownloadIcon className="mr-2 size-5" />
							Error Reports
						</Button>
						<Button size="sm" className="w-full py-3">
							<DownloadIcon className="mr-2 size-5" />
							Deplyment History
						</Button>
					</>
				)}
				{currentRole === 'Marketing/Sales Admin' && (
					<>
						<Button size="sm" className="w-full py-3">
							<DownloadIcon className="mr-2 size-5" />
							User List (All)
						</Button>
						<Button size="sm" className="w-full py-3">
							<DownloadIcon className="mr-2 size-5" />
							User Lists (by Tier)
						</Button>
						<Button size="sm" className="w-full py-3">
							<DownloadIcon className="mr-2 size-5" />
							Campaign Performance
						</Button>
						<Button size="sm" className="w-full py-3">
							<DownloadIcon className="mr-2 size-5" />
							Conversion Data
						</Button>
						<Button size="sm" className="w-full py-3">
							<DownloadIcon className="mr-2 size-5" />
							Engagement Metrics
						</Button>
					</>
				)}
			</div>
		</Section>
	);
};
