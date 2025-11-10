import { URLS } from '@/constants/url.constant';
import { AxiosResult } from '@/types/axios.type';
import { api } from '@/services/axios.service';
import { CampaignAnalyticsType } from '../_types/CampaignAnalytics.type';

export const useCampaignAnalytics = () => {
	const getCampaignAnalytics = async ({ campaignId, workflowId }: { campaignId?: string; workflowId?: string }) => {
		let result: AxiosResult<CampaignAnalyticsType>;

		try {
			let url = `${URLS.API}/campaign/campaign-analytics`;
			if (campaignId) url += `?campaignId=${campaignId}`;
			if (workflowId) url += `?workflowId=${workflowId}`;

			const response = await api.get<CampaignAnalyticsType>(url);
			result = { data: response.data, isError: false, message: '' };
		} catch (error) {
			const message = (error as any).response?.data?.message || 'Error occurred!';
			result = { data: null, isError: true, message };
		}

		return result;
	};

	const getUserCampaignAnalytics = async () => {
		let result: AxiosResult<CampaignAnalyticsType[]>;

		try {
			const response = await api.get<CampaignAnalyticsType[]>(`${URLS.API}/campaign/campaign-analytics/user`);
			result = { data: response.data, isError: false, message: '' };
		} catch (error) {
			const message = (error as any).response?.data?.message || 'Error occurred!';
			result = { data: null, isError: true, message };
		}

		return result;
	};

	return { getCampaignAnalytics, getUserCampaignAnalytics };
};
