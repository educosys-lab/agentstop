import { Edit3Icon, PlusCircleIcon, Trash2Icon } from 'lucide-react';

import { AdminRole, ModalType } from '../_types/admin.type';

import { Section } from '../_modules/Section';
import { Button } from '../../../components/ui/button';
import { Table } from '../_modules/Table';

type RoleManagementViewProps = {
	adminRoles: AdminRole[];
	commonActions: { key: string; icon: string; label: string; onClick: () => void }[];
	openModal: (title: string, type: ModalType, modalId: string, initialData?: AdminRole | FormData) => void;
};

export const RoleManagementView = ({ adminRoles, commonActions, openModal }: RoleManagementViewProps) => {
	const roleColumns = [
		{ key: 'name' as keyof AdminRole, label: 'Role Name' },
		{
			key: 'permissions' as keyof AdminRole,
			label: 'Permissions',
			render: (permissions: string | string[]) =>
				Array.isArray(permissions) ? permissions.join(', ') : permissions,
		},
		{ key: 'users' as keyof AdminRole, label: 'Users Count' },
	];

	return (
		<Section
			title="Role Management"
			actions={[
				...commonActions.map((action) => (
					<Button key={action.key} variant="outline" size="sm" onClick={action.onClick} className="py-5">
						{action.label}
					</Button>
				)),
				<Button key="add" onClick={() => openModal('Create Role', 'createRole', 'create-role-modal')}>
					<PlusCircleIcon className="mr-2 size-5" />
					Create Role
				</Button>,
			]}
		>
			<Table
				columns={roleColumns}
				data={adminRoles}
				renderRowActions={(role) => (
					<div className="flex">
						<Button
							variant="ghost"
							size="sm"
							onClick={() => openModal('Edit Role', 'editRole', 'edit-role-modal', role)}
						>
							<Edit3Icon />
							<span className="sr-only">Edit</span>
						</Button>
						<Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300">
							<Trash2Icon />
							<span className="sr-only">Delete</span>
						</Button>
					</div>
				)}
			/>
		</Section>
	);
};
