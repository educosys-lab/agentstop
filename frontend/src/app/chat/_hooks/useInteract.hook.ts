import { toast } from 'sonner';

import { api } from '@/services/axios.service';
import { URLS } from '@/constants/url.constant';
import { AxiosResult } from '@/types/axios.type';
import { AddMessageType, InteractType, UpdateMembersType, UserInteractsType } from '../_types/interact.type';

import { useWebSocket } from '@/providers/WebSocket.provider';

export const useInteract = () => {
	const { socket } = useWebSocket();

	const getInteract = async (workflowId: string) => {
		let result: AxiosResult<InteractType>;

		try {
			const response = await api.get<InteractType>(`${URLS.API}/interact?workflowId=${workflowId}`);
			result = { data: response.data, isError: false, message: '' };
		} catch (error) {
			const message = (error as any).response?.data?.message || 'Error occurred!';
			result = { data: null, isError: true, message };
			toast.error(message);
			console.error('error', error);
		}

		return result;
	};

	const getUserInteracts = async () => {
		let result: AxiosResult<UserInteractsType[]>;

		try {
			const response = await api.get<UserInteractsType[]>(`${URLS.API}/interact/user`);
			result = { data: response.data, isError: false, message: '' };
		} catch (error) {
			const message = (error as any).response?.data?.message || 'Error occurred!';
			result = { data: null, isError: true, message };
			toast.error(message);
			console.error('error', error);
		}

		return result;
	};

	const sendMessage = async (data: AddMessageType) => {
		try {
			if (!socket) return;
			socket.emit('interact', { action: 'sendInteractMessage', data });
			return true;
		} catch (error) {
			const message = (error as any).response?.data?.message || 'Error occurred!';
			toast.error(message);
			console.error('error', error);
			return message;
		}
	};

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const addInteractMembers = async (props: UpdateMembersType) => {
		let result: AxiosResult<InteractType>;

		try {
			const response = await api.patch<InteractType>(`${URLS.API}/interact/members`, props);
			result = { data: response.data, isError: false, message: '' };
		} catch (error) {
			const message = (error as any).response?.data?.message || 'Error occurred!';
			result = { data: null, isError: true, message };
			toast.error(message);
			console.error('error', error);
		}

		return result;
	};

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const deleteInteractMembers = async (props: UpdateMembersType) => {
		let result: AxiosResult<boolean>;

		try {
			const response = await api.patch<boolean>(`${URLS.API}/interact/delete-members`, props);
			result = { data: response.data, isError: false, message: '' };
		} catch (error) {
			const message = (error as any).response?.data?.message || 'Error occurred!';
			result = { data: null, isError: true, message };
			toast.error(message);
			console.error('error', error);
		}

		return result;
	};

	return {
		getInteract,
		getUserInteracts,
		sendMessage,
	};
};
