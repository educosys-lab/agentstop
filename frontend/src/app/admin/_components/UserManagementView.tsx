import { Edit3Icon, EyeIcon, PlusCircleIcon, PowerIcon } from 'lucide-react';

import { ModalType, User } from '../_types/admin.type';

import { Section } from '../_modules/Section';
import { Button } from '../../../components/ui/button';
import { Table } from '../_modules/Table';

type UserManagementViewProps = {
	users: User[];
	commonActions: { key: string; icon: string; label: string; onClick: () => void }[];
	openModal: (title: string, type: ModalType, modalId: string, initialData?: User | FormData) => void;
};

export const UserManagementView = ({ users, commonActions, openModal }: UserManagementViewProps) => {
	const userColumns = [
		{ key: 'name' as keyof User, label: 'Name' },
		{ key: 'email' as keyof User, label: 'Email' },
		{ key: 'plan' as keyof User, label: 'Plan' },
		{
			key: 'status' as keyof User,
			label: 'Status',
			render: (status: string) => (
				<span
					className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold leading-5 ${
						status === 'Active'
							? 'bg-green-700 text-green-100'
							: status === 'Banned'
								? 'bg-red-700 text-red-100'
								: 'bg-slate-600 text-slate-200'
					}`}
				>
					{status}
				</span>
			),
		},
		{ key: 'joined' as keyof User, label: 'Joined' },
	];

	return (
		<Section
			title="User Management"
			actions={[
				...commonActions.map((action) => (
					<Button key={action.key} className="py-5" variant="outline" size="sm" onClick={action.onClick}>
						{action.label}
					</Button>
				)),
				<Button key="add" onClick={() => openModal('Add User', 'addUser', 'add-user-modal')} className="w-30">
					<PlusCircleIcon className="mr-2 size-5" />
					Add User
				</Button>,
			]}
		>
			<Table
				columns={userColumns}
				data={users}
				renderRowActions={(user) => (
					<div className="flex">
						<Button variant="ghost" size="sm" className="flex justify-between">
							<EyeIcon />
						</Button>
						<Button
							variant="ghost"
							size="sm"
							onClick={() => openModal('Edit User', 'editUser', 'edit-user-modal', user)}
						>
							<Edit3Icon />
						</Button>
						{user.status !== 'Banned' && (
							<Button
								variant="ghost"
								size="sm"
								className="text-red-400 hover:text-red-300"
								onClick={() => openModal('Ban User', 'banUser', 'ban-user-modal', user)}
							>
								<PowerIcon />
								<span className="sr-only">Ban</span>
							</Button>
						)}
					</div>
				)}
			/>
		</Section>
	);
};
