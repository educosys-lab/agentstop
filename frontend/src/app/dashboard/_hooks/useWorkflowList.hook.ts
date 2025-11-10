import { useEffect, useMemo, useState, useRef, KeyboardEvent, MouseEvent } from 'react';
import { toast } from 'sonner';

import { MODAL_IDS } from '@/constants/modal.constant';

import { useWorkflow } from '@/app/workflow/_hooks/useWorkflow.hook';
import { useAppDispatch, useAppSelector } from '@/store/hook/redux.hook';
import { workflowActions } from '@/store/features/workflow.slice';

import { useModal } from '@/providers/Modal.provider';

export const useWorkflowList = () => {
	const dispatch = useAppDispatch();
	const { getUserWorkflows, updateWorkflow, deleteWorkflow } = useWorkflow();
	const { openModal, closeModal, activeModals } = useModal();
	const userWorkflows = useAppSelector((state) => state.workflowState.userWorkflows);

	const [searchQuery, setSearchQuery] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const [isDropdownOpen, setIsDropdownOpen] = useState<string | null>(null);
	const [editingWorkflowId, setEditingWorkflowId] = useState<string | null>(null);
	const [editTitle, setEditTitle] = useState<string>('');
	const [workflowToDelete, setWorkflowToDelete] = useState<string | null>(null);

	const inputRef = useRef<HTMLInputElement>(null);

	const filteredWorkflows = useMemo(() => {
		if (!searchQuery) return userWorkflows;

		return userWorkflows.filter((workflow) => workflow.title.toLowerCase().includes(searchQuery.toLowerCase()));
	}, [searchQuery, userWorkflows]);

	const fetchUserWorkflows = async () => {
		if (isLoading) return;

		setIsLoading(true);

		const response = await getUserWorkflows();
		if (!response.isError) {
			dispatch(workflowActions.setValue({ userWorkflows: response.data }));
		} else {
			toast.error(response.message || 'Error fetching user missions!');
		}

		setIsLoading(false);
	};

	const updateWorkflowTitle = (workflowId: string, newTitle: string) => {
		dispatch(
			workflowActions.setValue({
				userWorkflows: userWorkflows.map((workflow) =>
					workflow.id === workflowId ? { ...workflow, title: newTitle } : workflow,
				),
			}),
		);
	};

	const toggleDropdown = (event: MouseEvent, workflowId: string) => {
		event.stopPropagation();
		setIsDropdownOpen((prev) => (prev === workflowId ? null : workflowId));
	};

	const onRenameWorkflow = (workflowId: string, currentTitle: string) => {
		setEditingWorkflowId(workflowId);
		setEditTitle(currentTitle);
		setIsDropdownOpen(null);
		setTimeout(() => inputRef.current?.focus(), 0);
	};

	const saveTitle = async (workflowId: string) => {
		if (!editTitle.trim()) {
			toast.error('Workflow name cannot be empty!');
			setEditingWorkflowId(null);
			return;
		}

		const response = await updateWorkflow({ workflowId, updates: { title: editTitle }, isLive: false });
		if (response.isError) {
			toast.error(response?.message || 'Error updating mission name!');
			return;
		}

		updateWorkflowTitle(workflowId, editTitle);
		setEditingWorkflowId(null);
		setEditTitle('');
		toast.success('Workflow name updated successfully!');
	};

	const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>, workflowId: string) => {
		if (event.key === 'Enter') {
			event.preventDefault();
			saveTitle(workflowId);
		}
	};

	const handleDeleteClick = (event: MouseEvent, workflowId: string) => {
		event.stopPropagation();

		if (filteredWorkflows.find((w) => w.id === workflowId)?.status === 'live') {
			toast.error('Please make the mission offline to delete!');
			return;
		}
		setWorkflowToDelete(workflowId);
		openModal(MODAL_IDS.DELETE_WORKFLOW);
	};

	const handleDeleteConfirm = async () => {
		if (!workflowToDelete) return;
		const response = await deleteWorkflow(workflowToDelete);

		if (response.isError) {
			toast.error(response?.message || 'Error deleting mission!');
			return;
		}

		dispatch(
			workflowActions.setValue({
				userWorkflows: filteredWorkflows.filter((w) => w.id !== workflowToDelete),
			}),
		);
		setWorkflowToDelete(null);
		closeModal(MODAL_IDS.DELETE_WORKFLOW);
		setIsDropdownOpen(null);
		toast.success('Workflow deleted successfully!');
	};

	const handleDeleteCancel = () => {
		setWorkflowToDelete(null);
		closeModal(MODAL_IDS.DELETE_WORKFLOW);
	};

	useEffect(() => {
		fetchUserWorkflows();
	}, []);

	useEffect(() => {
		const handleClickOutside = (event: globalThis.MouseEvent) => {
			if (!(event.target as Element)?.closest('.dropdown-container')) {
				setIsDropdownOpen(null);
			}
		};
		document.addEventListener('click', handleClickOutside);
		return () => document.removeEventListener('click', handleClickOutside);
	}, []);

	return {
		searchQuery,
		setSearchQuery,
		filteredWorkflows,
		isLoading,
		fetchUserWorkflows,
		isDropdownOpen,
		toggleDropdown,
		editingWorkflowId,
		editTitle,
		setEditTitle,
		onRenameWorkflow,
		saveTitle,
		handleKeyDown,
		handleDeleteClick,
		handleDeleteConfirm,
		handleDeleteCancel,
		activeModals,
		inputRef,
	};
};
