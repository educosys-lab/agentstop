import { toast } from 'sonner';
import axios from 'axios';

import { api } from '@/services/axios.service';
import {
	SigninUserType,
	SignupUserType,
	UpdateUserType,
	UserFileType,
	UserSsoConfigType,
	UserType,
} from '@/types/user.type';
import { AxiosResult } from '@/types/axios.type';
import { URLS } from '@/constants/url.constant';

import { resetAll } from './useReset.hook';
import { useAppDispatch, useAppSelector } from '@/store/hook/redux.hook';
import { userActions } from '@/store/features/user.slice';

export const useUser = () => {
	const dispatch = useAppDispatch();
	const userState = useAppSelector((state) => state.userState);

	// Get user
	const getUser = async (email: string) => {
		let result: AxiosResult<UserType & { ssoConfig: UserSsoConfigType[]; files: UserFileType[] }>;

		try {
			const response = await axios.get<UserType & { ssoConfig: UserSsoConfigType[]; files: UserFileType[] }>(
				`${URLS.API}/user?email=${email}`,
			);
			result = { data: response.data, isError: false, message: '' };
		} catch (error) {
			const message = (error as any).response?.data?.message || 'Error occurred!';
			result = { data: null, isError: true, message };
			console.error('error', error);
		}

		return result;
	};

	// Signin user with email and password
	const signinUser = async (data: SigninUserType) => {
		let result: AxiosResult<UserType & { ssoConfig: UserSsoConfigType[] }>;

		try {
			const response = await axios.post<UserType & { ssoConfig: UserSsoConfigType[] }>(
				`${URLS.API}/auth/signin`,
				data,
				{ withCredentials: true },
			);
			result = { data: response.data, isError: false, message: '' };
		} catch (error) {
			const message = (error as any).response?.data?.message || 'Error occurred!';
			result = { data: null, isError: true, message };
			console.error('error', error);
		}

		return result;
	};

	// Signup user with email and password
	const signupUser = async (data: SignupUserType) => {
		let result: AxiosResult<UserType & { ssoConfig: UserSsoConfigType[] }>;

		try {
			const response = await axios.post<UserType & { ssoConfig: UserSsoConfigType[] }>(
				`${URLS.API}/auth/signup`,
				data,
			);
			result = { data: response.data, isError: false, message: '' };
		} catch (error) {
			const message = (error as any).response?.data?.message || 'Error occurred!';
			result = { data: null, isError: true, message };
			console.error('error', error);
		}

		return result;
	};

	// Update user data
	const updateUser = async (data: UpdateUserType) => {
		let result: AxiosResult<UserType & { ssoConfig: UserSsoConfigType[]; files: UserFileType[] }>;

		try {
			const response = await api.patch<UserType & { ssoConfig: UserSsoConfigType[]; files: UserFileType[] }>(
				`${URLS.API}/user`,
				data,
			);
			result = { data: response.data, isError: false, message: '' };

			const { ssoConfig, files, ...rest } = response.data;
			dispatch(userActions.setValue({ user: rest, files, ssoConfig, lastSynced: Date.now() }));

			// toast.success('Profile updated successfully');
		} catch (error) {
			// toast.error('An error occurred during profile update, please try again!');

			const message = (error as any).response?.data?.message || 'Error occurred!';
			result = { data: null, isError: true, message };
			console.error('error', error);
		}

		return result;
	};

	// Delete user SSO config
	const deleteUserSsoConfig = async (id: string) => {
		let result: AxiosResult<boolean>;

		if (!userState.user) return { data: null, isError: true, message: 'User not found!' };

		try {
			const response = await api.delete<boolean>(`${URLS.API}/user/delete-sso-config?id=${id}`);
			result = { data: response.data, isError: false, message: '' };

			const updatedConfigs = userState.ssoConfig?.filter((config) => config.id !== id) || [];
			dispatch(userActions.setValue({ ssoConfig: updatedConfigs, lastSynced: Date.now() }));
		} catch (error) {
			const message = (error as any).response?.data?.message || 'Error occurred!';
			toast.error(message);
			result = { data: null, isError: true, message };
			console.error('error', error);
		}

		return result;
	};

	// Delete user file
	const deleteUserFile = async (id: string) => {
		let result: AxiosResult<boolean>;

		try {
			const response = await api.delete<boolean>(`${URLS.API}/user/delete-file?id=${id}`);
			result = { data: response.data, isError: false, message: '' };

			const updatedFiles = userState.files?.filter((file) => file.id !== id) || [];
			dispatch(userActions.setValue({ files: updatedFiles }));
		} catch (error) {
			const message = (error as any).response?.data?.message || 'Error occurred!';
			toast.error(message);
			result = { data: null, isError: true, message };
			console.error('error', error);
		}

		return result;
	};

	// Delete user profile
	const deleteUserProfile = async () => {
		let result: AxiosResult<boolean>;

		try {
			const response = await api.delete<boolean>(`${URLS.API}/user`);
			result = { data: response.data, isError: false, message: '' };
			signOutUser();

			// toast.success('Account deletion successful. Redirecting to home page...');
			// router.push(URLS.HOME);
		} catch (error) {
			// toast.error('Account deletion failed. Please try again later');

			const message = (error as any).response?.data?.message || 'Error occurred!';
			result = { data: null, isError: true, message };
			console.error('error', error);
		}

		return result;
	};

	return {
		getUser,
		signinUser,
		signupUser,
		updateUser,
		deleteUserSsoConfig,
		deleteUserFile,
		deleteUserProfile,
	};
};

// Sign-out user
export const signOutUser = async () => {
	resetAll();

	try {
		await axios.get<UserType>(`${URLS.API}/auth/logout`);
		window.location.href = URLS.HOME;
	} catch (error) {
		console.error('error', error);
	}
};
