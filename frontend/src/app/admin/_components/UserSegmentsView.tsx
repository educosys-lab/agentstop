import { PlusCircleIcon } from 'lucide-react';

import { ModalType } from '../_types/admin.type';

import { Section } from '../_modules/Section';
import { Button } from '../../../components/ui/button';

type UserSegmentsViewProps = {
	commonActions: { key: string; icon: string; label: string; onClick: () => void }[];
	openModal: (title: string, type: ModalType, modalId: string, initialData?: FormData) => void;
};

export const UserSegmentsView = ({ commonActions, openModal }: UserSegmentsViewProps) => {
	return (
		<Section
			title="User Segments"
			actions={[
				...commonActions.map((action) => (
					<Button key={action.key} variant="outline" size="sm" onClick={action.onClick} className="py-5">
						{action.label}
					</Button>
				)),
				<Button
					key="create"
					onClick={() => openModal('Create Segment', 'createSegment', 'create-segment-modal')}
				>
					<PlusCircleIcon className="mr-2 size-5" />
					Create Segment
				</Button>,
			]}
		>
			<p className="text-slate-400">No segments created yet. Start by creating a new user segment.</p>
		</Section>
	);
};
