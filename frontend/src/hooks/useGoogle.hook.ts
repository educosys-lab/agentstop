import { useSearchParams } from 'next/navigation';
import axios from 'axios';
import { toast } from 'sonner';

import { DATA } from '@/constants/data.constant';
import { GoogleFileType } from '@/types/google.type';
import { UpdateUserType, UserSsoConfigType } from '@/types/user.type';

import { useUser } from './useUser.hook';
import { useAppSelector } from '@/store/hook/redux.hook';
import { workflowStore } from '@/app/workflow/_store/workflow.store';

export const useGoogle = () => {
	const searchParams = useSearchParams();
	const { updateUser } = useUser();
	const user = useAppSelector((state) => state.userState.user);

	const googleFiles = workflowStore((state) => state.googleFiles);
	const setWSValue = workflowStore((state) => state.setWSValue);
	const isLoading = workflowStore((state) => state.isLoading);

	const collectDataFromSearchParams = async () => {
		try {
			if (!user) return;

			const access_token = searchParams.get('access_token');
			const refresh_token = searchParams.get('refresh_token');
			const id_token = searchParams.get('id_token');
			const nodeId = searchParams.get('nodeId');

			if (!access_token || !refresh_token || !id_token || !nodeId) return;

			const userInfo = await getUserInfo(access_token);
			if (!userInfo) {
				toast.error('Failed to fetch user info from Google!');
				return;
			}

			const newData: UpdateUserType = {
				ssoConfig: {
					access_token,
					refresh_token,
					id_token,
					name: userInfo.name || '',
					email: userInfo.email || '',
					provider: 'google',
				},
			};

			await updateUser(newData);

			const url = new URL(window.location.href);
			url.searchParams.delete('access_token');
			url.searchParams.delete('refresh_token');
			url.searchParams.delete('id_token');
			url.searchParams.delete('nodeId');
			window.history.replaceState({}, '', url);

			return { access_token, refresh_token };
		} catch (error) {
			toast.error('Error collecting data from search params!');
			console.error('Error collecting data from search params:', error);
		}
	};

	const getUserInfo = async (access_token: string) => {
		try {
			const response = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
				headers: { Authorization: `Bearer ${access_token}` },
			});

			if (!response.data) toast.error(`Google API error: ${response.status}`);
			return response.data;
		} catch (error) {
			toast.error('Error fetching Google user info!');
			console.error('Error fetching Google user info:', error);
			return null;
		}
	};

	const refreshAccessToken = async (refresh_token: string) => {
		try {
			const response = await axios.post(
				'https://oauth2.googleapis.com/token',
				new URLSearchParams({
					client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
					client_secret: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET!,
					refresh_token,
					grant_type: 'refresh_token',
				}),
			);

			return {
				access_token: response.data.access_token,
				id_token: response.data.id_token,
			};
		} catch (error) {
			toast.error('Invalid refresh token!');
			console.error('Error refreshing access token:', error);
			return null;
		}
	};

	const fetchGoogleContent = async (access_token: string) => {
		try {
			const url = 'https://www.googleapis.com/drive/v3/files';
			const queryParams = new URLSearchParams({
				q: "mimeType='application/vnd.google-apps.document' or mimeType='application/vnd.google-apps.spreadsheet'",
				fields: 'files(id, name, mimeType)',
				pageSize: '1000',
			});

			const response = await axios.get(`${url}?${queryParams}`, {
				headers: { Authorization: `Bearer ${access_token}` },
			});

			if (!response.data.files) toast.error(`Google API error: ${response.status}`);
			return response.data.files as GoogleFileType[];
		} catch (error: any) {
			if (error.response?.data?.error?.code === 401) return null;

			toast.error('Error fetching Google Docs and Sheets!');
			console.error('Error fetching Google Docs and Sheets:', error);
			return [];
		}
	};

	const refreshTokens = async (selectedConfig: UserSsoConfigType) => {
		const newTokens = await refreshAccessToken(selectedConfig.refresh_token);
		if (!newTokens) return null;

		const userInfo = await getUserInfo(newTokens.access_token);
		if (!userInfo) {
			toast.error('Failed to fetch user info from Google!');
			return;
		}

		const updatedData: UpdateUserType = {
			ssoConfig: {
				id: selectedConfig.id,
				access_token: newTokens.access_token,
				id_token: newTokens.id_token,
				name: userInfo.name || '',
				email: userInfo.email || '',
			},
		};

		await updateUser(updatedData);

		return newTokens;
	};

	const getGoogleDataToShow = async (selectedConfig: UserSsoConfigType | undefined): Promise<true | null> => {
		if (isLoading === 'getGoogleDataToShow') return null;

		try {
			setWSValue({ isLoading: 'getGoogleDataToShow' });
			if (!selectedConfig) return null;
			const { access_token, email } = selectedConfig;

			let filesData: GoogleFileType[] | null = null;
			const isExpired = Date.now() - selectedConfig.created > DATA.MINUTE_IN_MS * 50; // 50 Mins

			if (isExpired) {
				const newTokens = await refreshTokens(selectedConfig);
				if (!newTokens) return null;

				const fetchResult = await fetchGoogleContent(newTokens.access_token);
				if (fetchResult) filesData = fetchResult;
				return null;
			} else {
				const response = await fetchGoogleContent(access_token);
				if (response) filesData = response;
				else {
					const newTokens = await refreshTokens(selectedConfig);
					if (!newTokens) return null;

					const fetchResult = await fetchGoogleContent(newTokens.access_token);
					if (fetchResult) filesData = fetchResult;
					return null;
				}
			}

			if (!filesData) {
				setWSValue({ googleFiles: { ...googleFiles, [email]: [] } });
				return true;
			}

			setWSValue({ googleFiles: { ...googleFiles, [email]: filesData } });
			return true;
		} catch (error) {
			console.error('Error getting required data to show:', error);
			return true;
		} finally {
			setWSValue({ isLoading: '' });
		}
	};

	return { collectDataFromSearchParams, getGoogleDataToShow };
};
