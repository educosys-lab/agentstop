import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type ChatStoreSyncedType = {
	lastOpenChatId: string;

	setChatSyncedValue: (data: Partial<Omit<ChatStoreSyncedType, 'setChatSyncedValue'>>) => void;
};

export const chatStoreSynced = create<ChatStoreSyncedType>()(
	persist(
		(set) => ({
			lastOpenChatId: '',

			setChatSyncedValue: (data) => set((state) => ({ ...state, ...data })),
		}),
		{ name: 'chat-synced' },
	),
);
