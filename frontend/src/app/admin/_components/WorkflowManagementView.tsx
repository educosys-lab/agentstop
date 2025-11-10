import { Edit3Icon, EyeIcon, PlusCircleIcon, PowerIcon } from 'lucide-react';

import { ModalType, Workflow } from '../_types/admin.type';

import { Section } from '../_modules/Section';
import { Button } from '../../../components/ui/button';
import { Table } from '../_modules/Table';

type WorkflowManagementViewProps = {
	workflows: Workflow[];
	commonActions: { key: string; icon: string; label: string; onClick: () => void }[];
	openModal: (title: string, type: ModalType, modalId: string, initialData?: Workflow | FormData) => void;
};

export const WorkflowManagementView = ({ workflows, commonActions, openModal }: WorkflowManagementViewProps) => {
	const workflowColumns = [
		{ key: 'name' as keyof Workflow, label: 'Workflow Name' },
		{
			key: 'status' as keyof Workflow,
			label: 'Status',
			render: (status: string) => (
				<span
					className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold leading-5 ${
						status === 'Active'
							? 'bg-green-700 text-green-100'
							: status === 'Paused'
								? 'bg-gray-600 text-white'
								: 'bg-red-700 text-red-100'
					}`}
				>
					{status}
				</span>
			),
		},
		{ key: 'executions' as keyof Workflow, label: 'Executions' },
		{ key: 'errors' as keyof Workflow, label: 'Errors' },
		{ key: 'lastRun' as keyof Workflow, label: 'Last Run' },
	];

	return (
		<Section
			title="Workflow Management"
			actions={[
				...commonActions.map((action) => (
					<Button key={action.key} variant="outline" size="sm" onClick={action.onClick} className="py-5">
						{action.label}
					</Button>
				)),
				<Button
					key="create"
					onClick={() => openModal('Create Mission', 'createWorkflow', 'create-workflow-modal')}
				>
					<PlusCircleIcon className="mr-2 size-5" />
					Create Workflow
				</Button>,
			]}
		>
			<Table
				columns={workflowColumns}
				data={workflows}
				renderRowActions={(workflow) => (
					<div className="flex">
						<Button variant="ghost" size="sm">
							<EyeIcon />
						</Button>
						<Button
							variant="ghost"
							size="sm"
							onClick={() => openModal('Edit Workflow', 'editWorkflow', 'edit-workflow-modal', workflow)}
						>
							<Edit3Icon />
						</Button>
						<Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300">
							<PowerIcon />
						</Button>
					</div>
				)}
			/>
		</Section>
	);
};
