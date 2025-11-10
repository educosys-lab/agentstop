import { ArrowLeftIcon, ChevronLeftIcon, TriangleAlertIcon, WorkflowIcon, BarChart3Icon } from 'lucide-react';

import { cn } from '@/utils/theme.util';
import { URLS } from '@/constants/url.constant';
import { InteractType } from '../_types/interact.type';

import { LinkElement } from '@/components/elements/LinkElement';
import { ButtonElement } from '@/components/elements/ButtonElement';

type InteractTopbarPropsType = {
	isSidebarOpen: boolean;
	setIsSidebarOpen: (isOpen: boolean) => void;
	selectedInteract: InteractType | undefined;
	isAnalyticsPresent: boolean;
	showAnalytics: boolean;
	onToggleAnalytics: () => void;
};

export default function InteractTopbar({
	isSidebarOpen,
	setIsSidebarOpen,
	selectedInteract,
	isAnalyticsPresent,
	showAnalytics,
	onToggleAnalytics,
}: InteractTopbarPropsType) {
	return (
		<div className="flex h-18 shrink-0 items-center border-b border-gray-800 bg-gray-900 px-2">
			<LinkElement
				href={URLS.DASHBOARD}
				title="Go to Dashboard"
				className="flex items-center gap-1.5 text-sm transition-all hover:text-primary"
			>
				<ArrowLeftIcon className="size-4" />
				Dashboard
			</LinkElement>

			<span className="mx-5 h-8 w-0.5 rounded-full bg-muted-dark" />

			{!showAnalytics && (
				<ButtonElement
					onClick={() => (isSidebarOpen ? setIsSidebarOpen(false) : setIsSidebarOpen(true))}
					title="Toggle sidebar"
					variant={'wrapper'}
					className="mr-3 rounded-md p-2 text-gray-400 transition-all hover:bg-muted-dark hover:text-gray-200"
				>
					<ChevronLeftIcon
						className={cn('size-5 stroke-[3px] transition-all', !isSidebarOpen && 'rotate-180')}
					/>
				</ButtonElement>
			)}

			{selectedInteract && (
				<>
					<div className="mr-3 flex size-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-600">
						<span className="text-lg font-bold">{selectedInteract.workflowTitle[0]}</span>
					</div>

					<div>
						<div className="max-w-48 truncate font-medium">{selectedInteract.workflowTitle}</div>
					</div>

					<div className="ml-auto flex items-center gap-1.5">
						{selectedInteract.status !== 'live' && (
							<>
								<div className="flex items-center gap-1.5 rounded-lg bg-warn-dark/25 px-3 py-2">
									<TriangleAlertIcon className="size-5 text-warn" />
									<p className="text-sm">Inactive Mission</p>
								</div>
								<span className="mx-2 h-8 w-0.5 rounded-full bg-muted-dark" />
							</>
						)}

						{/* Analytics Toggle Button */}
						{isAnalyticsPresent && (
							<>
								<ButtonElement
									onClick={onToggleAnalytics}
									title={showAnalytics ? 'Hide Analytics' : 'Show Analytics'}
									variant={'wrapper'}
									className={cn(
										'rounded-md p-2 transition-all hover:bg-muted-dark',
										showAnalytics
											? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
											: 'text-gray-400 hover:text-gray-200',
									)}
								>
									<BarChart3Icon className="size-5" />
								</ButtonElement>
								<span className="mx-2 h-8 w-0.5 rounded-full bg-muted-dark" />
							</>
						)}

						<LinkElement
							href={`${URLS.WORKFLOW_EDIT}?workflowId=${selectedInteract.workflowId}`}
							target="_blank"
							rel="noopener noreferrer"
							title="Edit mission"
							className="rounded-md transition-all hover:bg-transparent hover:text-primary"
						>
							<WorkflowIcon className="size-6" />
						</LinkElement>
					</div>
				</>
			)}
		</div>
	);
}
