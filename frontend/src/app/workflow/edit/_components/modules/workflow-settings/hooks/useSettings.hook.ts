import { FormEvent, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { useWorkflow } from '@/app/workflow/_hooks/useWorkflow.hook';
import { useWorkflowEditor } from '../../../hooks/useWorkflowEditor.hook';
import { useAppSelector } from '@/store/hook/redux.hook';
import { workflowStoreSynced } from '@/app/workflow/_store/workflow-synced.store';

type FormDataType = {
	showResultFromAllNodes: { value: boolean; error: string };
};

export const useSettings = () => {
	const { updateAndSyncWorkflow } = useWorkflow();
	const { isLive, selectedNodeIds } = useWorkflowEditor();

	const workflow = useAppSelector((state) => state.workflowState.workflow);
	const isSettingsSidebarOpen = workflowStoreSynced((state) => state.isSettingsSidebarOpen);
	const setWSSyncedValue = workflowStoreSynced((state) => state.setWSSyncedValue);

	const [formData, setFormData] = useState<FormDataType | undefined>();

	const updateFormData = (key: keyof FormDataType, value: any) => {
		if (!formData) return;
		setFormData((prev) => ({ ...prev, [key]: { value, error: '' } }));
	};

	const onSubmitForm = async (event: FormEvent) => {
		event.preventDefault();
		if (!formData) return;

		const updatedForm: { [key: string]: any } = {};
		Object.keys(formData).forEach((key) => {
			updatedForm[key] = formData[key as keyof FormDataType].value;
		});

		const response = await updateAndSyncWorkflow({ updates: { generalSettings: updatedForm }, isLive });

		if (response && !response.isError) toast.success('Mission updated successfully!');
	};

	useEffect(() => {
		if (!workflow) return;

		const generalSettings = workflow.generalSettings;
		const newFormData: { [key: string]: any } = {};

		Object.keys(generalSettings).forEach((key) => {
			newFormData[key] = { value: generalSettings[key], error: '' };
		});

		setFormData(newFormData as FormDataType);
	}, [workflow]);

	useEffect(() => {
		if (selectedNodeIds.length < 1 || !isSettingsSidebarOpen) return;
		setWSSyncedValue({ isSettingsSidebarOpen: false });
	}, [selectedNodeIds]);

	return { formData, updateFormData, onSubmitForm };
};
