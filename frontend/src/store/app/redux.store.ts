import { configureStore } from '@reduxjs/toolkit';
import { createLogger } from 'redux-logger';

import { userReducer } from '../features/user.slice';
import { localStorageService } from '@/services/local-storage.service';
import { dashboardReducer } from '../features/dashboard.slice';
import { workflowReducer } from '../features/workflow.slice';

const logger = createLogger();

export const store = configureStore({
	reducer: {
		userState: userReducer,
		dashboardState: dashboardReducer,
		workflowState: workflowReducer,
	},
	middleware: (getDefaultMiddleware) => {
		const isProduction = process.env.NEXT_PUBLIC_ENV === 'production';
		if (isProduction) return getDefaultMiddleware();
		else return getDefaultMiddleware().concat(logger);
	},
});

store.subscribe(() => {
	const {
		userState: { user, lastSynced },
		dashboardState,
		workflowState: { userWorkflows, publicWorkflows },
	} = store.getState();

	const syncState = {
		userState: { user, lastSynced },
		dashboardState,
		workflowState: { userWorkflows, publicWorkflows },
	};

	localStorageService.set('store', syncState);
});

export type StoreType = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
