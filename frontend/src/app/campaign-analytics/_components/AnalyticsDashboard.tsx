import { useState } from 'react';
import { ArrowLeftIcon, ChevronLeftIcon, RotateCwIcon } from 'lucide-react';
import { RiBroadcastLine } from 'react-icons/ri';
import { XIcon, SendIcon, MessageCircleIcon, CheckCircleIcon } from 'lucide-react';
import ReactPlayer from 'react-player';

import { cn } from '@/utils/theme.util';
import { CampaignAnalyticsType } from '../_types/CampaignAnalytics.type';
import { ButtonElement } from '@/components/elements/ButtonElement';
import { URLS } from '@/constants/url.constant';

import { ResponseOverDay } from '@/app/campaign-analytics/_components/ResponseOverDay';
import { ResponseOverMonth } from '@/app/campaign-analytics/_components/ResponseOverMonth';
import { CampaignResponse } from '@/app/campaign-analytics/_components/CampaignResponse';
import { CampaignReach } from '@/app/campaign-analytics/_components/CampaignReach';
import { LinkElement } from '@/components/elements/LinkElement';

type AnalyticsDashboardProps = {
	isSidebarOpen?: boolean;
	setIsSidebarOpen?: (isOpen: boolean) => void;
	selectedAnalytics?: CampaignAnalyticsType;
	refreshCampaignAnalytics: () => Promise<void>;
	onClose?: () => void;
};

export default function AnalyticsDashboard({
	isSidebarOpen,
	setIsSidebarOpen,
	selectedAnalytics,
	refreshCampaignAnalytics,
	onClose,
}: AnalyticsDashboardProps) {
	const [isRefreshing, setIsRefreshing] = useState(false);

	const handleRefresh = async () => {
		setIsRefreshing(true);
		await refreshCampaignAnalytics();
		setIsRefreshing(false);
	};

	return (
		<div className="flex size-full flex-col">
			{/* Header */}
			<div
				className={cn('flex h-16 items-center border-b-2 border-gray-800 px-4 py-4 md:px-6', onClose && 'h-18')}
			>
				{!onClose && (
					<>
						<LinkElement
							href={URLS.DASHBOARD}
							title="Go to Dashboard"
							className="flex items-center gap-1.5 text-sm transition-all hover:text-primary"
						>
							<ArrowLeftIcon className="size-4" />
							Dashboard
						</LinkElement>

						<span className="mx-3 h-8 w-0.5 rounded-full bg-muted-dark" />

						<ButtonElement
							onClick={() => {
								if (!setIsSidebarOpen) return;
								isSidebarOpen ? setIsSidebarOpen(false) : setIsSidebarOpen(true);
							}}
							title="Toggle sidebar"
							variant={'wrapper'}
							className="mr-3 rounded-md p-2 text-gray-400 transition-all hover:bg-muted-dark hover:text-gray-200"
						>
							<ChevronLeftIcon
								className={cn('size-5 stroke-[3px] transition-all', !isSidebarOpen && 'rotate-180')}
							/>
						</ButtonElement>
					</>
				)}

				<div className="min-w-0 flex-1">
					<h2 className="truncate text-lg font-bold text-white md:text-xl">
						{selectedAnalytics
							? `${selectedAnalytics.campaign.campaignName} Analytics`
							: 'Analytics Dashboard'}
					</h2>
				</div>

				<ButtonElement
					onClick={handleRefresh}
					title="Refresh"
					variant="wrapper"
					className={cn(
						'ml-2 flex-shrink-0 rounded-md p-2 text-gray-400 transition-all hover:text-gray-500',
						isRefreshing && 'animate-spin',
					)}
				>
					<RotateCwIcon className="size-4 md:size-5" />
				</ButtonElement>

				{onClose && (
					<ButtonElement
						onClick={onClose}
						title="Close Analytics"
						variant={'wrapper'}
						className="ml-4 flex-shrink-0 rounded-md p-2 text-gray-400 transition-all hover:bg-gray-700 hover:text-gray-200"
					>
						<XIcon className="size-4 md:size-5" />
					</ButtonElement>
				)}
			</div>

			{selectedAnalytics ? (
				// Content
				<div className="flex-1 space-y-4 overflow-y-auto p-4 md:space-y-6 md:p-6">
					{/* KPI Cards */}
					<div className="grid grid-cols-2 gap-4">
						{/* Total Messages Sent */}
						<div className="rounded-lg border border-blue-500/30 bg-gradient-to-r from-blue-500/20 to-blue-600/20 p-4">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm text-blue-300">Messages Sent</p>
									<p className="text-2xl font-bold text-white">
										{selectedAnalytics.messages.messagesSent}
									</p>
									{/* <p className="flex items-center gap-1 text-xs text-green-400">
									<TrendingUpIcon className="size-3" />
									+14.2% from last campaign
								</p> */}
								</div>

								<SendIcon className="size-8 text-blue-400" />
							</div>
						</div>

						{/* Total Messages Received */}
						<div className="rounded-lg border border-yellow-500/30 bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 p-4">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm text-yellow-300">Messages Received</p>
									<p className="text-2xl font-bold text-white">
										{selectedAnalytics.messages.messagesReceived}
									</p>
									{/* <p className="flex items-center gap-1 text-xs text-green-400">
									<TrendingUpIcon className="size-3" />
									+1.2% from last week
								</p> */}
								</div>

								<CheckCircleIcon className="size-8 text-yellow-400" />
							</div>
						</div>

						{/* Messages Read */}
						<div className="rounded-lg border border-purple-500/30 bg-gradient-to-r from-purple-500/20 to-purple-600/20 p-4">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm text-purple-300">Messages Failed</p>
									<p className="text-2xl font-bold text-white">
										{selectedAnalytics.messages.messagesFailed}
									</p>
									{/* <p className="flex items-center gap-1 text-xs text-green-400">
									<TrendingUpIcon className="size-3" />
									+9.7% from last campaign
								</p> */}
								</div>

								<RiBroadcastLine className="size-8 text-purple-400" />
							</div>
						</div>

						{/* Messages Unread */}
						<div className="rounded-lg border border-green-500/30 bg-gradient-to-r from-green-500/20 to-green-600/20 p-4">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm text-green-300">Messages Unread</p>
									<p className="text-2xl font-bold text-white">
										{selectedAnalytics.messages.messagesUnread}
									</p>
									{/* <p className="flex items-center gap-1 text-xs text-green-400">
									<TrendingUpIcon className="size-3" />
									+3.4% engagement
								</p> */}
								</div>

								<MessageCircleIcon className="size-8 text-green-400" />
							</div>
						</div>
					</div>

					{/* Charts Section */}
					<div className="space-y-6">
						<ResponseOverDay data={selectedAnalytics.responses} />
						<ResponseOverMonth data={selectedAnalytics.responses} />

						<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
							<CampaignReach reach={selectedAnalytics.messages.reach} />
							<CampaignResponse response={selectedAnalytics.messages.responsePercentage} />
						</div>
					</div>

					{/* Mission Status */}
					<div className="flex flex-col gap-4 rounded-lg border border-gray-700 bg-gray-800 p-4 md:p-6 tablet:flex-row tablet:gap-10">
						<div>
							<h3 className="mb-2 text-base font-semibold text-white md:text-lg">Mission Title</h3>
							<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
								<p className="text-lg font-bold text-white md:text-xl">
									{selectedAnalytics.workflow.title}
								</p>
							</div>
						</div>
						<div>
							<h3 className="mb-2 text-base font-semibold text-white md:text-lg">Mission Status</h3>
							<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
								<div
									className={cn(
										'inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium',
										selectedAnalytics.workflow.status === 'live'
											? 'border border-green-500/30 bg-green-500/20 text-green-400'
											: 'border border-red-500/30 bg-red-500/20 text-red-400',
									)}
								>
									<div
										className={cn(
											'h-2 w-2 flex-shrink-0 rounded-full',
											selectedAnalytics.workflow.status === 'live'
												? 'bg-green-400'
												: 'bg-red-400',
										)}
									/>
									<span className="truncate">
										{selectedAnalytics.workflow.status === 'live' ? 'Live' : 'Inactive'}
									</span>
								</div>
							</div>
						</div>
					</div>
				</div>
			) : (
				<div className="flex size-full flex-col items-center justify-center text-center">
					<ReactPlayer url={`${URLS.VIDEOS}/logoHappyAnimation.webm`} playing loop muted className="h-20" />
					<h5 className="mb-2 text-blue-400">No analytics selected</h5>
					<p className="text-gray-400">Select an analytics to view the dashboard</p>
				</div>
			)}
		</div>
	);
}
