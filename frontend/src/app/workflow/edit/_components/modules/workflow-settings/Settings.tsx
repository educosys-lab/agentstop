import { workflowStoreSynced } from '@/app/workflow/_store/workflow-synced.store';
import { useWorkflowEditor } from '../../hooks/useWorkflowEditor.hook';
import { useSettings } from './hooks/useSettings.hook';
import { useAppSelector } from '@/store/hook/redux.hook';

import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ButtonElement } from '@/components/elements/ButtonElement';

export default function Settings() {
	const user = useAppSelector((state) => state.userState.user);
	const workflow = useAppSelector((state) => state.workflowState.workflow);
	const isSettingsSidebarOpen = workflowStoreSynced((state) => state.isSettingsSidebarOpen);

	const { selectedNodeIds, isLive } = useWorkflowEditor();
	const { formData, updateFormData, onSubmitForm } = useSettings();

	if (selectedNodeIds.length !== 0 || !isSettingsSidebarOpen || !formData || !user || !workflow) return null;
	return (
		<div className="relative h-full w-[320px] shrink-0 space-y-7 overflow-auto border-l-2 bg-background/10 px-4 py-6">
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
	);
}
