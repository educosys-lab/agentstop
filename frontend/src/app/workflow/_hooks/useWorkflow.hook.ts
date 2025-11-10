import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

import { api } from '@/services/axios.service';
import { URLS } from '@/constants/url.constant';
import { TestNodeResponseType, UpdateWorkflowType, UserWorkflowType, WorkflowType } from '../_types/workflow.type';
import { WorkflowToolDataType } from '../edit/_components/types/tool-node-config.type';
import { AxiosResult } from '@/types/axios.type';

import { useAppDispatch, useAppSelector } from '@/store/hook/redux.hook';
import { workflowStore } from '../_store/workflow.store';
import { useWorkflowEditor } from '../edit/_components/hooks/useWorkflowEditor.hook';
import { workflowActions } from '@/store/features/workflow.slice';

export const useWorkflow = () => {
	const dispatch = useAppDispatch();
	const router = useRouter();
	const workflow = useAppSelector((state) => state.workflowState.workflow);
	const { selectedNodeType, selectedNodeIds } = useWorkflowEditor();

	const setWSValue = workflowStore((state) => state.setWSValue);

	const getWorkflow = async (workflowId: string) => {
		let result: AxiosResult<WorkflowType>;

		try {
			const response = await api.get<WorkflowType>(`${URLS.API}/workflow?workflowId=${workflowId}`);

			result = { data: response.data, isError: false, message: '' };
		} catch (error) {
			const message = (error as any).response?.data?.message || 'Error occurred!';
			result = { data: null, isError: true, message };
			console.error('Error fetching mission:', error);
		}

		return result;
	};

	const getUserWorkflows = async () => {
		let result: AxiosResult<UserWorkflowType[]>;

		try {
			const response = await api.get<UserWorkflowType[]>(`${URLS.API}/workflow/user`);
			result = { data: response.data, isError: false, message: '' };
		} catch (error) {
			const message = (error as any).response?.data?.message || 'Error occurred!';
			result = { data: null, isError: true, message };
			console.error('Error fetching missions:', error);
		}

		return result;
	};

	const getPublicWorkflows = async () => {
		let result: AxiosResult<WorkflowType[]>;

		try {
			const response = await api.get<WorkflowType[]>(`${URLS.API}/workflow/public`);
			result = { data: response.data, isError: false, message: '' };

			// dispatch(workflowActions.setValue({ publicWorkflows: response.data }));
		} catch (error) {
			// toast.error('Error fetching public missions!');

			const message = (error as any).response?.data?.message || 'Error occurred!';
			result = { data: null, isError: true, message };
			console.error('Error fetching missions:', error);
		}

		return result;
	};

	const createWorkflow = async (title: string) => {
		let result: AxiosResult<string>;

		try {
			const response = await api.post<string>(`${URLS.API}/workflow`, { title });
			result = { data: response.data, isError: false, message: '' };
		} catch (error) {
			const message = (error as any).response?.data?.message || 'Error occurred!';
			result = { data: null, isError: true, message };
			console.error('Error creating mission:', error);
		}

		return result;
	};

	const updateWorkflow = async (props: { workflowId: string; updates: UpdateWorkflowType; isLive: boolean }) => {
		const { workflowId, updates, isLive } = props;

		if (isLive) return { data: workflow, isError: false, message: '' };

		// let totalTries = 0;
		let result: AxiosResult<WorkflowType>;

		try {
			setWSValue({ workflowSyncStatus: 'Syncing' });

			const response = await api.patch<WorkflowType>(`${URLS.API}/workflow?workflowId=${workflowId}`, {
				updates,
			});
			result = { data: response.data, isError: false, message: '' };

			setWSValue({ workflowSyncStatus: 'Synced' });
		} catch (error) {
			const message = (error as any).response?.data?.message || 'Error occurred!';
			result = { data: null, isError: true, message };
			console.error('Error updating mission:', error);

			setWSValue({ workflowSyncStatus: 'Not Synced' });

			// if (totalTries < 3) {
			// 	totalTries++;
			// 	await updateWorkflow(props);
			// }
		}

		return result;
	};

	const updateAndSyncWorkflow = async (props: { updates: UpdateWorkflowType; isLive: boolean }) => {
		const { updates, isLive } = props;
		if (!workflow) return;

		const response = await updateWorkflow({ workflowId: workflow.id, updates, isLive });
		if (response.data) dispatch(workflowActions.updateWorkflow(response.data));
		return response;
	};

	const updateCompleteWorkflow = async (props: {
		workflowId: string;
		updates: Partial<WorkflowType>;
		isLive: boolean;
	}) => {
		// const { workflowId, updates, isLive } = props;

		// if (isLive) return { data: workflow, isError: false, message: '' };

		// let result: AxiosResult<WorkflowType>;

		// try {
		// 	setWSValue({ workflowSyncStatus: 'Syncing' });

		// 	const response = await api.patch<WorkflowType>(`${URLS.API}/workflow/complete?workflowId=${workflowId}`, {
		// 		updates,
		// 	});
		// 	result = { data: response.data, isError: false, message: '' };

		// 	setWSValue({ workflowSyncStatus: 'Synced' });
		// 	dispatch(workflowActions.updateWorkflow(response.data));
		// } catch (error) {
		// 	const message = (error as any).response?.data?.message || 'Error occurred!';
		// 	result = { data: null, isError: true, message };
		// 	console.error('Error updating mission:', error);

		// 	setWSValue({ workflowSyncStatus: 'Not Synced' });
		// }

		// return result;

		const { updates, isLive } = props;

		if (isLive) return { data: workflow, isError: false, message: '' };

		const selectedUpdates = { nodes: updates.nodes, edges: updates.edges };

		return await updateAndSyncWorkflow({ updates: selectedUpdates, isLive });
	};

	const deleteWorkflow = async (workflowId: string) => {
		let result: AxiosResult<boolean>;

		try {
			const response = await api.delete<boolean>(`${URLS.API}/workflow?workflowId=${workflowId}`);
			result = { data: response.data, isError: false, message: '' };

			toast.success('Workflow deleted successfully!');
			router.push(URLS.DASHBOARD);
		} catch (error) {
			toast.error('Error deleting mission!');

			const message = (error as any).response?.data?.message || 'Error occurred!';
			result = { data: null, isError: true, message };
			console.error('Error deleting mission:', error);
		}

		return result;
	};

	const getAllNodes = async () => {
		let result: AxiosResult<WorkflowToolDataType[]>;

		try {
			const response = await api.get<WorkflowToolDataType[]>(`${URLS.API}/workflow-system/nodes`);
			result = { data: response.data, isError: false, message: '' };
		} catch (error) {
			const message = (error as any).response?.data?.message || 'Error occurred!';
			result = { data: null, isError: true, message };
			console.error('Error getting nodes:', error);
		}

		return result;
	};

	const executeWorkflow = async (workflowId: string) => {
		let result: AxiosResult<WorkflowType>;

		try {
			const response = await api.post<WorkflowType>(`${URLS.API}/workflow-system/start-workflow`, { workflowId });
			result = { data: response.data, isError: false, message: '' };
			dispatch(workflowActions.updateWorkflow(response.data));
		} catch (error) {
			const message = (error as any).response?.data?.message || 'Error occurred!';
			result = { data: null, isError: true, message };
			console.error('Error executing mission:', error);
		}

		return result;
	};

	const terminateWorkflow = async (workflowId: string) => {
		let result: AxiosResult<boolean>;

		try {
			const response = await api.post<boolean>(`${URLS.API}/workflow-system/stop-workflow`, { workflowId });
			result = { data: response.data, isError: false, message: '' };
		} catch (error) {
			const message = (error as any).response?.data?.message || 'Error occurred!';
			result = { data: null, isError: true, message };
			console.error('Error executing mission:', error);
		}

		return result;
	};

	const testNode = async (input: string) => {
		if (!workflow || !selectedNodeType) return { data: null, isError: true as const, message: '' };

		let result: AxiosResult<TestNodeResponseType>;

		try {
			const nodeConfig = workflow.config[selectedNodeIds[0]] || {};
			const data = { nodeType: selectedNodeType, input, config: nodeConfig };

			const response = await api.post<TestNodeResponseType>(`${URLS.API}/workflow-system/test-node`, data);
			result = { data: response.data, isError: false, message: '' };
		} catch (error) {
			const message = (error as any).response?.data?.message || 'Error occurred!';
			result = { data: null, isError: true, message };
			console.error('Error testing node:', error);
		}

		return result;
	};

	const getUserGlobalMissionStats = async () => {
		let result: AxiosResult<{ currentExecutions: number; totalExecutions: number }>;

		try {
			const response = await api.get<{ currentExecutions: number; totalExecutions: number }>(
				`${URLS.API}/workflow/global-mission-stats`,
			);
			result = { data: response.data, isError: false, message: '' };
		} catch (error) {
			const message = (error as any).response?.data?.message || 'Error occurred!';
			result = { data: null, isError: true, message };
			console.error('Error fetching stats', error);
		}

		return result;
	};

	return {
		getWorkflow,
		getUserWorkflows,
		getPublicWorkflows,
		createWorkflow,
		updateWorkflow,
		updateCompleteWorkflow,
		updateAndSyncWorkflow,
		deleteWorkflow,
		getAllNodes,
		executeWorkflow,
		terminateWorkflow,
		testNode,
		getUserGlobalMissionStats,
	};
};
