import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { MODAL_IDS } from '@/constants/modal.constant';
import { URLS } from '@/constants/url.constant';

import { useWorkflow } from '@/app/workflow/_hooks/useWorkflow.hook';

import { useModal } from '@/providers/Modal.provider';

export const useNewWorkflow = () => {
	const router = useRouter();
	const { closeModal } = useModal();
	const { createWorkflow } = useWorkflow();

	const [isLoading, setIsLoading] = useState(false);
	const [newWorkflow, setNewWorkflow] = useState('');
	const [errorMessage, setErrorMessage] = useState('');

	const handleCreateWorkflow = async (event: FormEvent) => {
		event.preventDefault();
		setErrorMessage('');

		if (!newWorkflow.trim()) {
			setErrorMessage('Please enter a name for the mission');
			return;
		}
		if (newWorkflow.length > 15) {
			setErrorMessage('Name must be within 15 characters');
			return;
		}

		if (isLoading) return;
		setIsLoading(true);

		const response = await createWorkflow(newWorkflow);

		if (!response.isError) {
			toast.success('Mission created successfully!');
			closeModal(MODAL_IDS.NEW_WORKFLOW);
			router.push(`${URLS.WORKFLOW_EDIT}?workflowId=${response.data}`);
		} else {
			setErrorMessage(response.message);
			setIsLoading(false);
			toast.error('Error creating mission!');
		}
	};

	const onCloseModal = () => {
		setNewWorkflow('');
		setErrorMessage('');
		closeModal(MODAL_IDS.NEW_WORKFLOW);
	};

	return { isLoading, newWorkflow, setNewWorkflow, handleCreateWorkflow, errorMessage, onCloseModal };
};
