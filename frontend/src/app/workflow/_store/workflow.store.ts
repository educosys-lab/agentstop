import { Editor } from '@tiptap/react';
import { create } from 'zustand';

type WorkflowStoreType = {
	isEditingText: boolean;
	activeTextEditor: Editor | null;
	activeTextColor: string;
	activeTextEditorFontSize: number;
	workflowSyncStatus: 'Syncing' | 'Synced' | 'Not Synced';
	isMouseDown: boolean;
	nodesConnectionWarning: string;
	googleFiles: { [email: string]: { id: string; mimeType: string; name: string }[] } | null;
	isLoading: string;
	isConfigBarOpen: boolean;
	ragSourceNames: string[] | null;

	setWSValue: (data: Partial<Omit<WorkflowStoreType, 'setWSValue'>>) => void;
};

export const workflowStore = create<WorkflowStoreType>((set) => ({
	isEditingText: false,
	activeTextEditor: null,
	activeTextColor: '#ffffff',
	activeTextEditorFontSize: 16,
	workflowSyncStatus: 'Synced',
	isMouseDown: false,
	nodesConnectionWarning: '',
	googleFiles: null,
	isLoading: '',
	isConfigBarOpen: false,
	ragSourceNames: null,

	setWSValue: (data) => set((state) => ({ ...state, ...data })),
}));
