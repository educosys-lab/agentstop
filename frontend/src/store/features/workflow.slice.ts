import { PayloadAction, createSlice } from '@reduxjs/toolkit';

import { localStorageService } from '@/services/local-storage.service';
import { UserWorkflowType, WorkflowType } from '@/app/workflow/_types/workflow.type';

type WorkflowStateType = {
	workflow: WorkflowType | null;
	userWorkflows: UserWorkflowType[];
	publicWorkflows: WorkflowType[];
	currentExecutions: number;
	totalExecutions: number;
};

const defaultValue = {
	workflow: null,
	userWorkflows: [],
	publicWorkflows: [],
	currentExecutions: 0,
	totalExecutions: 0,
};

const getCachedWorkflowState = () => {
	const storeCached = localStorageService.get('store');
	if (storeCached && storeCached.workflowState) {
		return { ...defaultValue, ...storeCached.workflowState };
	}
	return defaultValue;
};

const initialState: WorkflowStateType = getCachedWorkflowState();

const workflowSlice = createSlice({
	name: 'workflow',
	initialState,
	reducers: {
		setValue: (state, action: PayloadAction<Partial<WorkflowStateType>>) => {
			const copiedValue = JSON.parse(JSON.stringify(action.payload));
			return (state = { ...state, ...copiedValue });
		},
		updateWorkflow: (state, action: PayloadAction<Partial<WorkflowType>>) => {
			if (!state.workflow) return state;
			const copiedValue = JSON.parse(JSON.stringify(action.payload));
			return (state = { ...state, workflow: { ...state.workflow, ...copiedValue } });
		},
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		resetWorkflow: (state) => (state = defaultValue),
	},
});

export const workflowReducer = workflowSlice.reducer;
export const workflowActions = workflowSlice.actions;
