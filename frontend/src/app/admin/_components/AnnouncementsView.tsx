import { Edit3Icon, PlusCircleIcon, Trash2Icon } from 'lucide-react';

import { Announcement, ModalType } from '../_types/admin.type';

import { Section } from '../_modules/Section';
import { Button } from '../../../components/ui/button';
import { Table } from '../_modules/Table';

type AnnouncementsViewProps = {
	announcements: Announcement[];
	commonActions: { key: string; icon: string; label: string; onClick: () => void }[];
	openModal: (title: string, type: ModalType, modalId: string, initialData?: Announcement | FormData) => void;
	currentView: string;
};

export const AnnouncementsView = ({ announcements, commonActions, openModal, currentView }: AnnouncementsViewProps) => {
	const announcementColumns = [
		{ key: 'title' as keyof Announcement, label: 'Title' },
		{ key: 'type' as keyof Announcement, label: 'Type' },
		{ key: 'audience' as keyof Announcement, label: 'Audience' },
		{ key: 'date' as keyof Announcement, label: 'Date' },
		{
			key: 'status' as keyof Announcement,
			label: 'Status',
			render: (status: string) => (
				<span
					className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold leading-5 ${
						status === 'Published' || status === 'Sent'
							? 'bg-green-700 text-green-100'
							: status === 'Scheduled'
								? 'bg-blue-600 text-blue-100'
								: 'bg-slate-600 text-slate-200'
					}`}
				>
					{status}
				</span>
			),
		},
	];

	return (
		<Section
			title={currentView}
			actions={[
				...commonActions.map((action) => (
					<Button key={action.key} variant="outline" size="sm" onClick={action.onClick} className="py-5">
						{action.label}
					</Button>
				)),
				<Button
					key="create"
					onClick={() =>
						openModal(
							currentView === 'Announcements' ? 'Create Announcement' : 'Create Campaign',
							'createAnnouncement',
							'create-announcement-modal',
						)
					}
				>
					<PlusCircleIcon className="mx-1" />
					Create {currentView === 'Announcements' ? 'Announcement' : 'Campaign'}
				</Button>,
			]}
		>
			<Table
				columns={announcementColumns}
				data={announcements}
				renderRowActions={(announcement) => (
					<div className="flex">
						<Button
							variant="ghost"
							size="sm"
							onClick={() =>
								openModal(
									'Edit Announcement',
									'editAnnouncement',
									'edit-announcement-modal',
									announcement,
								)
							}
						>
							<Edit3Icon />
						</Button>
						<Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300">
							<Trash2Icon />
						</Button>
					</div>
				)}
			/>
		</Section>
	);
};
