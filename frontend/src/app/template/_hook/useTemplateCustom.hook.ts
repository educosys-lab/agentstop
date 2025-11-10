import { useEffect, useState } from 'react';

import { api } from '@/services/axios.service';
import { URLS } from '@/constants/url.constant';
import { AxiosResult } from '@/types/axios.type';
import { TemplateType } from '../_types/template.type';

import { workflowStoreSynced } from '@/app/workflow/_store/workflow-synced.store';

export const useTemplateCustom = () => {
	const isHydrated = workflowStoreSynced((state) => state.isHydrated);
	const workflowTemplates = workflowStoreSynced((state) => state.workflowTemplates);
	const lastUpdated = workflowStoreSynced((state) => state.lastUpdated);
	const setWSSyncedValue = workflowStoreSynced((state) => state.setWSSyncedValue);

	const [isLoading, setIsLoading] = useState<'allTemplates' | undefined>(undefined);

	const getAllTemplates = async () => {
		let result: AxiosResult<TemplateType[]>;
		setIsLoading('allTemplates');

		try {
			const response = await api.get<TemplateType[]>(`${URLS.API}/template/all`);
			result = { data: response.data, isError: false, message: '' };
		} catch (error) {
			const message = (error as any).response?.data?.message || 'Error occurred!';
			result = { data: null, isError: true, message };
			console.error('Error fetching templates:', error);
		}

		setWSSyncedValue({ workflowTemplates: result.data || [] });
		setIsLoading(undefined);
	};

	useEffect(() => {
		if (!isHydrated || isLoading === 'allTemplates') return;
		if (process.env.NEXT_PUBLIC_ENV !== 'production') {
			getAllTemplates();
			return;
		}

		const refetchInterval = 1 * 60 * 60 * 1000; // 1 hour
		const timeNow = Date.now();
		const shouldRefetch = timeNow - (lastUpdated || 0) > refetchInterval;

		if (shouldRefetch || !workflowTemplates) getAllTemplates();
	}, [isHydrated]);

	return { getAllTemplates };
};
