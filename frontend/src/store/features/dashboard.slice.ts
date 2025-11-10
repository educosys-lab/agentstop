import { PayloadAction, createSlice } from '@reduxjs/toolkit';

import { localStorageService } from '@/services/local-storage.service';

type DashboardStateType = {
	view: 'grid' | 'list';
};

const getCachedDashboardState = () => {
	const storeCached = localStorageService.get('store');
	if (storeCached && storeCached.dashboard) return storeCached.dashboard;
	return {
		view: 'grid',
	};
};

const initialState: DashboardStateType = getCachedDashboardState();

const dashboardSlice = createSlice({
	name: 'dashboard',
	initialState,
	reducers: {
		setValue: (state, action: PayloadAction<Partial<DashboardStateType>>) => {
			return (state = { ...state, ...action.payload });
		},
	},
});

export const dashboardReducer = dashboardSlice.reducer;
export const dashboardActions = dashboardSlice.actions;
