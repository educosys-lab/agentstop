import { ChevronLeftIcon, SearchIcon } from 'lucide-react';

import { cn } from '@/utils/theme.util';
import { InteractType, UserInteractsType } from '../_types/interact.type';
import { URLS } from '@/constants/url.constant';

import { useAppSelector } from '@/store/hook/redux.hook';

import { ButtonElement } from '@/components/elements/ButtonElement';
import { LinkElement } from '@/components/elements/LinkElement';
import { ImageElement } from '@/components/elements/ImageElement';
import { IMAGES } from '@/constants/image.constant';
import { motion } from 'framer-motion';

type InteractListPropsType = {
	isSidebarOpen: boolean;
	setIsSidebarOpen: (isOpen: boolean) => void;
	searchTerm: string;
	setSearchTerm: (term: string) => void;
	filteredInteracts: UserInteractsType[];
	selectedInteract: InteractType | undefined;
	onSelectInteract: (interact: string) => void;
};

export default function InteractList({
	isSidebarOpen,
	setIsSidebarOpen,
	searchTerm,
	setSearchTerm,
	filteredInteracts,
	selectedInteract,
	onSelectInteract,
}: InteractListPropsType) {
	const user = useAppSelector((state) => state.userState.user);

	return (
		<div
			className={cn(
				'fixed z-10 flex h-full w-60 shrink-0 flex-col border-r border-gray-800 bg-gray-800 transition-all duration-300 tablet:relative tablet:w-72',
				!isSidebarOpen && 'hidden',
			)}
		>
			<div className="flex items-center justify-between gap-2 py-5 pl-4 pr-1">
				<LinkElement href={user ? URLS.DASHBOARD : URLS.HOME} title="Agentstop" className="flex items-center">
					<ImageElement src={IMAGES.BRAND.LOGO} alt="Agentstop" className="size-10 object-contain" />
					<motion.h1
						animate={{
							textShadow: [
								'0px 0px 4px rgba(59, 130, 246, 0)',
								'0px 0px 12px rgba(59, 130, 246, 0.7)',
								'0px 0px 12px rgba(217, 70, 239, 0.7)',
								'0px 0px 4px rgba(217, 70, 239, 0)',
							],
						}}
						transition={{
							textShadow: {
								duration: 2.5,
								ease: 'easeInOut',
								repeat: Infinity,
								repeatType: 'mirror',
							},
						}}
						className={cn('gradient-primary bg-clip-text text-2xl font-bold text-transparent')}
					>
						Agentstop
					</motion.h1>
				</LinkElement>

				<ButtonElement
					onClick={() => (isSidebarOpen ? setIsSidebarOpen(false) : setIsSidebarOpen(true))}
					title="Toggle sidebar"
					variant={'wrapper'}
					className="mr-3 rounded-md p-1 text-gray-400 transition-all hover:bg-muted-dark hover:text-gray-200 tablet:hidden"
				>
					<ChevronLeftIcon
						className={cn('size-5 stroke-[3px] transition-all', !isSidebarOpen && 'rotate-180')}
					/>
				</ButtonElement>
			</div>

			<div className="border-b-2 border-t-2 border-gray-700 px-2 py-2">
				<div className="relative">
					<div className="absolute left-2 top-2.5 text-gray-400">
						<SearchIcon className="size-5" />
					</div>
					<input
						value={searchTerm}
						onChange={(event) => setSearchTerm(event.target.value)}
						placeholder="Search Missions ..."
						className="w-full rounded-md border border-gray-700/60 bg-gray-700 py-2 pl-9 pr-2 text-gray-200 outline-none transition-all duration-300 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
					/>
				</div>
			</div>

			<div className="mb-2 flex-1 overflow-auto px-1.5">
				{filteredInteracts.map((interact) => (
					<div
						key={interact.workflowTitle}
						onClick={() => onSelectInteract(interact.workflowId)}
						className={cn(
							'mt-2 flex transform cursor-pointer items-center space-x-3 rounded-md border-[2.5px] border-transparent p-3 transition-all duration-300 hover:bg-gray-700 hover:px-3.5',
							selectedInteract?.workflowId === interact.workflowId &&
								'border-blue-500/50 bg-gradient-to-r from-blue-700/60 to-purple-700/60',
						)}
					>
						<div className="relative flex size-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-600">
							<span className="text-lg font-semibold">{interact.workflowTitle[0]}</span>

							<div
								className={cn(
									'absolute inset-[0_-2px_auto_auto] size-3 rounded-full',
									interact.status === 'live' ? 'bg-success' : 'bg-muted',
								)}
							/>
						</div>

						<div className="flex-1 overflow-hidden">
							<div className="truncate font-medium">{interact.workflowTitle}</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
