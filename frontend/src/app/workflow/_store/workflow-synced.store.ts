import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { WorkflowToolDataType } from '../edit/_components/types/tool-node-config.type';
import { TemplateType } from '@/app/template/_types/template.type';

type WorkflowStoreSyncedType = {
	isHydrated: boolean;
	isNodeListSidebarOpen: boolean;
	nodesData: WorkflowToolDataType[] | null;
	lastUpdated: number | null;
	isSettingsSidebarOpen: boolean;
	workflowTemplates: TemplateType[] | null;

	setWSSyncedValue: (data: Partial<Omit<WorkflowStoreSyncedType, 'setWSSyncedValue'>>) => void;
};

export const workflowStoreSynced = create<WorkflowStoreSyncedType>()(
	persist(
		(set) => ({
			isHydrated: false,
			isNodeListSidebarOpen: true,
			nodesData: null,
			lastUpdated: null,
			isSettingsSidebarOpen: false,
			workflowTemplates: null,

			setWSSyncedValue: (data) => set((state) => ({ ...state, ...data })),
		}),
		{
			name: 'workflow-synced',
			onRehydrateStorage: (state) => {
				return () => state.setWSSyncedValue({ isHydrated: true });
			},
		},
	),
);
