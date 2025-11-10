import { FiX } from 'react-icons/fi';

import { cn } from '@/utils/theme.util';
import { MODAL_IDS } from '@/constants/modal.constant';

import { useGeneralSettings } from './hooks/useGeneralSettings.hook';
import { useAppSelector } from '@/store/hook/redux.hook';
import { useWorkflowEditor } from '../../hooks/useWorkflowEditor.hook';

import { useModal } from '@/providers/Modal.provider';

import { ButtonElement } from '@/components/elements/ButtonElement';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

export default function GeneralSettings() {
	const user = useAppSelector((state) => state.userState.user);
	const workflow = useAppSelector((state) => state.workflowState.workflow);

	const { activeModals, closeModal } = useModal();
	const { formData, updateFormData, onSubmitForm } = useGeneralSettings();
	const { isLive } = useWorkflowEditor();

	if (!formData || !user || !workflow) return null;
	return (
		<div
			className={cn(
				'fixed inset-0 z-10 flex items-center justify-center bg-black/60 p-3 backdrop-blur-md',
				!activeModals.includes(MODAL_IDS.GENERAL_SETTINGS) && 'hidden',
			)}
		>
			<div className="relative size-full max-h-[500px] max-w-3xl rounded-xl bg-light/10 p-10">
				<ButtonElement
					onClick={() => closeModal(MODAL_IDS.GENERAL_SETTINGS)}
					variant="wrapper"
					title="Close"
					className="absolute right-4 top-4 text-muted transition-colors hover:text-foreground"
				>
					<FiX size={24} />
				</ButtonElement>

				<form onSubmit={onSubmitForm} className="flex h-full flex-col gap-4 overflow-auto">
					{workflow.creator.username === user.username && (
						<div className="flex items-center gap-2">
							<div className="flex items-center gap-2">
								<Checkbox
									id="showResultFromAllNodes"
									checked={formData.showResultFromAllNodes.value}
									onCheckedChange={(value) => updateFormData('showResultFromAllNodes', value)}
									disabled={isLive}
								/>
							</div>
							<Label htmlFor="showResultFromAllNodes" className="cursor-pointer text-base">
								Show result from all nodes
							</Label>
						</div>
					)}

					<ButtonElement
						disabled={isLive}
						title="Save"
						type="submit"
						variant="primary"
						className="mx-auto mt-auto shrink-0 px-10"
					>
						Save
					</ButtonElement>
				</form>
			</div>
		</div>
	);
}
