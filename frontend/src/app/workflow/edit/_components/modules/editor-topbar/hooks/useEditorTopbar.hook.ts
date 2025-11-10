import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

import { validateNodeConfigs } from '../../node-config/utils/validateNodeConfigs.util';
import { MODAL_IDS } from '@/constants/modal.constant';

import { useAppDispatch, useAppSelector } from '@/store/hook/redux.hook';
import { useWorkflow } from '@/app/workflow/_hooks/useWorkflow.hook';
import { workflowActions } from '@/store/features/workflow.slice';
import { workflowStore } from '@/app/workflow/_store/workflow.store';
import { useWorkflowEditor } from '../../../hooks/useWorkflowEditor.hook';
import { workflowStoreSynced } from '@/app/workflow/_store/workflow-synced.store';

import { useModal } from '@/providers/Modal.provider';

export const useEditorTopbar = () => {
	const dispatch = useAppDispatch();
	const workflow = useAppSelector((state) => state.workflowState.workflow);

	const { openModal } = useModal();
	const { executeWorkflow, terminateWorkflow, testNode, updateAndSyncWorkflow } = useWorkflow();
	const { isLive } = useWorkflowEditor();
	const setWSValue = workflowStore((state) => state.setWSValue);
	const setWSSyncedValue = workflowStoreSynced((state) => state.setWSSyncedValue);
	const isSettingsSidebarOpen = workflowStoreSynced((state) => state.isSettingsSidebarOpen);

	const [workflowTitle, setWorkflowTitle] = useState(workflow?.title || '');
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);

	const dropdownRef = useRef<HTMLDivElement | null>(null);

	const onToggleWorkflowStatus = async (value: boolean) => {
		if (!workflow) return;

		if (value) {
			for (const node of workflow.nodes) {
				const savedData = workflow.config[node.id];
				const validateResult = validateNodeConfigs({ nodeType: node.type, data: savedData });

				if (typeof validateResult !== 'boolean') {
					let errorMessage = '';

					Object.keys(validateResult).forEach((key) => {
						if (!validateResult[key]) return;
						errorMessage = errorMessage ? `${errorMessage}, ${validateResult[key]}` : validateResult[key];
					});

					return toast.error(`Error in node ${node.data.inputValue}: ${errorMessage}!`);
				}
			}

			const response = await executeWorkflow(workflow.id);

			if (!response.isError) {
				toast.success('Mission executed successfully!');
			} else {
				toast.error(response.message || 'Error executing mission!');
			}
		} else {
			const response = await terminateWorkflow(workflow.id);

			if (!response.isError) {
				toast.success('Mission terminated successfully!');
				dispatch(workflowActions.updateWorkflow({ status: 'inactive' }));
			} else {
				toast.error(response.message || 'Error terminating mission!');
			}
		}
	};

	const onToggleResponseSettings = async (value: boolean) => {
		if (!workflow) return;
		if (isLive) {
			toast.error('Live Mission can not be edited!');
			return;
		}

		const response = await updateAndSyncWorkflow({
			updates: { generalSettings: { showResultFromAllNodes: value } },
			isLive,
		});

		if (response && !response.isError) toast.success('Mission updated successfully!');
	};

	const onToggleSettingsSidebar = () => {
		setWSSyncedValue({ isSettingsSidebarOpen: !isSettingsSidebarOpen });
	};

	const onTitleUpdate = async () => {
		if (!workflow) return;
		if (isLive) {
			toast.error('Live Mission can not be edited!');
			return;
		}

		const response = await updateAndSyncWorkflow({ updates: { title: workflowTitle }, isLive });

		if (response && !response.isError) toast.success('Workflow title updated');
	};

	const onTestNode = async () => {
		const response = await testNode(JSON.stringify('Test'));

		if (!response.isError) {
			toast.success(response.message || 'Node tested successfully!');
		} else {
			toast.error(response.message || 'Error testing node!');
		}
	};

	const onGoToDashboard = () => {
		dispatch(workflowActions.setValue({ workflow: null }));
		setWSValue({
			isEditingText: false,
			activeTextEditor: null,
			workflowSyncStatus: 'Synced',
			isMouseDown: false,
			nodesConnectionWarning: '',
			googleFiles: null,
		});
	};

	const toggleDropdown = () => setIsDropdownOpen((prev) => !prev);

	const onClickAddTemplate = () => {
		openModal(MODAL_IDS.TEMPLATE_ADD);
	};

	useLayoutEffect(() => {
		if (!workflow || workflow.title === workflowTitle) return;
		setWorkflowTitle(workflow.title);
	}, [workflow]);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				isDropdownOpen &&
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target as Node) &&
				!(event.target as HTMLElement).closest('.menu-icon')
			) {
				setIsDropdownOpen(false);
			}
		};

		if (isDropdownOpen) document.addEventListener('click', handleClickOutside);

		return () => {
			document.removeEventListener('click', handleClickOutside);
		};
	}, [isDropdownOpen]);

	return {
		workflowTitle,
		setWorkflowTitle,
		showAllResponses: workflow?.generalSettings?.showResultFromAllNodes || false,
		onToggleWorkflowStatus,
		onTitleUpdate,
		onTestNode,
		onGoToDashboard,
		onToggleResponseSettings,
		onToggleSettingsSidebar,
		isDropdownOpen,
		toggleDropdown,
		dropdownRef,
		onClickAddTemplate,
	};
};
