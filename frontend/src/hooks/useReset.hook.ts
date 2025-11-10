import { workflowStoreSynced } from '@/app/workflow/_store/workflow-synced.store';
import { store } from '@/store/app/redux.store';
import { userActions } from '@/store/features/user.slice';
import { workflowActions } from '@/store/features/workflow.slice';

export const resetAll = () => {
	const setWSSyncedValue = workflowStoreSynced.getState().setWSSyncedValue;

	store.dispatch(userActions.resetUser());
	store.dispatch(workflowActions.resetWorkflow());
	setWSSyncedValue({ nodesData: null, lastUpdated: null });
};
