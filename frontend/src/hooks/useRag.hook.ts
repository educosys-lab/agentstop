import axios from 'axios';

import { useAppSelector } from '@/store/hook/redux.hook';

import { URLS } from '@/constants/url.constant';
import { AxiosResult } from '@/types/axios.type';
import { api } from '@/services/axios.service';

export const useRag = () => {
	const user = useAppSelector((state) => state.userState.user);

	// Get user rag source names
	const getUserRagSourceNames = async () => {
		let result: AxiosResult<string[]>;

		try {
			const response = await api.get<string[]>(`${URLS.API}/rag/user`);
			result = { data: response.data, isError: false, message: '' };
		} catch (error) {
			const message = (error as any).response?.data?.message || 'Error occurred!';
			result = { data: null, isError: true, message };
			console.error('error', error);
		}

		return result;
	};

	// Rag ingestion
	// const ragIngestion = async (data: RagIngestionType) => {
	// 	let result: AxiosResult<string[]>;

	// 	try {
	// 		const response = await api.post<string[]>(`${URLS.API}/rag/ingestion`, data);
	// 		result = { data: response.data, isError: false, message: '' };
	// 	} catch (error) {
	// 		const message = (error as any).response?.data?.message || 'Error occurred!';
	// 		result = { data: null, isError: true, message };
	// 		console.error('error', error);
	// 	}

	// 	return result;
	// };

	// Rag ingestion
	const ragIngestion = async (data: Record<string, unknown>) => {
		try {
			if (!user) return { data: null, isError: true, message: 'User not found!' };

			await axios.post(`${URLS.PYTHON}/rag/ingest`, data);

			const addSourceNameToUser = await api.post<string[]>(
				`${URLS.API}/rag/user/add-source?sourceName=${data.source_name}`,
			);

			return { data: addSourceNameToUser.data, isError: false, message: '' };
		} catch (error) {
			const message = (error as any).response?.data?.message || 'Error occurred!';
			console.error('error', error);
			return { data: null, isError: true, message };
		}
	};

	// Delete user rag source
	const deleteUserRagSource = async (sourceName: string) => {
		let result: AxiosResult<boolean>;

		try {
			const response = await api.delete<boolean>(`${URLS.API}/rag?sourceName=${sourceName}`);
			result = { data: response.data, isError: false, message: '' };
		} catch (error) {
			const message = (error as any).response?.data?.message || 'Error occurred!';
			result = { data: null, isError: true, message };
			console.error('error', error);
		}

		return result;
	};

	return { getUserRagSourceNames, ragIngestion, deleteUserRagSource };
};
