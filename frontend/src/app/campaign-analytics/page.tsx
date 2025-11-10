'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { CampaignAnalyticsType } from './_types/CampaignAnalytics.type';

import { useAppSelector } from '@/store/hook/redux.hook';
import { useCampaignAnalytics } from './_hooks/useCampaignAnalytics.hook';

import AnalyticsDashboard from './_components/AnalyticsDashboard';
import AnalyticsList from './_components/AnalyticsList';

export default function InteractPage() {
	const user = useAppSelector((state) => state.userState.user);
	const { getUserCampaignAnalytics } = useCampaignAnalytics();

	const [campaignAnalytics, setCampaignAnalytics] = useState<CampaignAnalyticsType[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [isSidebarOpen, setIsSidebarOpen] = useState(true);
	const [searchTerm, setSearchTerm] = useState('');
	const [selectedAnalytics, setSelectedAnalytics] = useState<CampaignAnalyticsType | undefined>();

	const filteredAnalytics = campaignAnalytics.filter((analytics) =>
		analytics.campaign.campaignName.toLowerCase().includes(searchTerm.toLowerCase()),
	);

	const fetchCampaignAnalytics = async () => {
		setIsLoading(true);

		const result = await getUserCampaignAnalytics();
		if (result.isError) toast.error(result.message);
		setCampaignAnalytics(result.data || []);

		setIsLoading(false);
	};

	const refreshCampaignAnalytics = async () => {
		const lastSelectedAnalyticsId = selectedAnalytics?.campaign.id;

		setSelectedAnalytics(undefined);
		await fetchCampaignAnalytics();

		if (lastSelectedAnalyticsId) {
			const lastSelectedAnalytics = campaignAnalytics.find(
				(analytics) => analytics.campaign.id === lastSelectedAnalyticsId,
			);
			if (lastSelectedAnalytics) setSelectedAnalytics(lastSelectedAnalytics);
		}
	};

	useEffect(() => {
		fetchCampaignAnalytics();
	}, []);

	if (!user) return null;
	return (
		<div className="flex h-dvh flex-col bg-background-dark sm:flex-row">
			<AnalyticsList
				isLoading={isLoading}
				isSidebarOpen={isSidebarOpen}
				setIsSidebarOpen={setIsSidebarOpen}
				searchTerm={searchTerm}
				setSearchTerm={setSearchTerm}
				filteredAnalytics={filteredAnalytics}
				selectedAnalytics={selectedAnalytics || undefined}
				onSelectAnalytics={(analytics) => setSelectedAnalytics(analytics)}
			/>

			<AnalyticsDashboard
				isSidebarOpen={isSidebarOpen}
				setIsSidebarOpen={setIsSidebarOpen}
				selectedAnalytics={selectedAnalytics}
				refreshCampaignAnalytics={refreshCampaignAnalytics}
			/>
		</div>
	);
}
