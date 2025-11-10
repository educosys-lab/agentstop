import { FormEvent, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { MODAL_IDS } from '@/constants/modal.constant';

import { useAppSelector } from '@/store/hook/redux.hook';
import { useWorkflow } from '@/app/workflow/_hooks/useWorkflow.hook';
import { useWorkflowEditor } from '../../../hooks/useWorkflowEditor.hook';

import { useModal } from '@/providers/Modal.provider';

type FormDataType = {
	showResultFromAllNodes: { value: boolean; error: string };
};

export const useGeneralSettings = () => {
	const { updateAndSyncWorkflow } = useWorkflow();
	const { isLive } = useWorkflowEditor();
	const { closeModal } = useModal();

	const workflow = useAppSelector((state) => state.workflowState.workflow);

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

		if (response && !response.isError) {
			toast.success('Mission updated successfully!');
			closeModal(MODAL_IDS.GENERAL_SETTINGS);
		}
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

	return { formData, updateFormData, onSubmitForm };
};
