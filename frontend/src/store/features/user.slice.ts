import { PayloadAction, createSlice } from '@reduxjs/toolkit';

import { localStorageService } from '@/services/local-storage.service';
import { UserFileType, UserSsoConfigType, UserType } from '@/types/user.type';

type UserStateType = {
	user: UserType | null;
	files: UserFileType[] | null;
	ssoConfig: UserSsoConfigType[] | null;
	lastSynced: number | null;
};

const defaultValue = { user: null, files: null, ssoConfig: null, lastSynced: null };

const getCachedUserState = () => {
	const storeCached = localStorageService.get('store');
	if (storeCached && storeCached.userState) {
		return { files: null, ssoConfig: null, ...storeCached.userState };
	}
	return defaultValue;
};

const initialState: UserStateType = getCachedUserState();

const userSlice = createSlice({
	name: 'user',
	initialState,
	reducers: {
		setValue: (state, action: PayloadAction<Partial<UserStateType>>) => {
			const copiedValue = JSON.parse(JSON.stringify(action.payload));
			return (state = { ...state, ...copiedValue });
		},
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		resetUser: (state) => (state = defaultValue),
	},
});

export const userReducer = userSlice.reducer;
export const userActions = userSlice.actions;
