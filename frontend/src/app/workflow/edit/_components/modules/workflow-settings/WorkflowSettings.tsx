import { useState } from 'react';
import { ChevronDownCircleIcon, SaveIcon, SettingsIcon, SlidersVerticalIcon } from 'lucide-react';

import { cn } from '@/utils/theme.util';
import { MODAL_IDS } from '@/constants/modal.constant';

import { useWorkflowEvents } from '../../hooks/useWorkflowEvents.hook';
import { useWorkflowEditor } from '../../hooks/useWorkflowEditor.hook';

import { useModal } from '@/providers/Modal.provider';

import { ButtonElement } from '@/components/elements/ButtonElement';
import AdvancedSettings from './AdvancedSettings';
import GeneralSettings from './GeneralSettings';

export default function WorkflowSettings() {
	const { onManualSave } = useWorkflowEvents();
	const { isLive } = useWorkflowEditor();
	const { openModal } = useModal();

	const [isSettingsOpen, setIsSettingsOpen] = useState(false);

	return (
		<div className="absolute inset-[auto_0_20px_0] mx-auto flex w-max items-center gap-6 rounded-md border bg-background px-4 py-3">
			<ButtonElement
				onClick={() => setIsSettingsOpen((prev) => !prev)}
				title="Open/Close settings"
				variant="wrapper"
				className="absolute inset-[-15px_0_auto_0] mx-auto w-max bg-background"
			>
				<ChevronDownCircleIcon className={cn('size-5', !isSettingsOpen && 'rotate-180')} />
			</ButtonElement>

			<ButtonElement
				onClick={() => openModal(MODAL_IDS.GENERAL_SETTINGS)}
				title="General settings"
				variant="wrapper"
				className={cn('flex flex-col items-center justify-center gap-0.5 text-sm', !isSettingsOpen && 'hidden')}
			>
				<SettingsIcon className="size-6" /> General
			</ButtonElement>

			<GeneralSettings />

			<ButtonElement
				onClick={() => openModal(MODAL_IDS.ADVANCED_SETTINGS)}
				title="Advanced settings"
				variant="wrapper"
				className={cn('flex flex-col items-center justify-center gap-0.5 text-sm', !isSettingsOpen && 'hidden')}
			>
				<SlidersVerticalIcon className="size-6" /> Advanced
			</ButtonElement>

			<AdvancedSettings />

			<ButtonElement
				disabled={isLive}
				onClick={onManualSave}
				title="Save"
				variant="wrapper"
				className={cn('flex flex-col items-center justify-center gap-0.5 text-sm', !isSettingsOpen && 'hidden')}
			>
				<SaveIcon className="size-6" /> Save
			</ButtonElement>
		</div>
	);
}
