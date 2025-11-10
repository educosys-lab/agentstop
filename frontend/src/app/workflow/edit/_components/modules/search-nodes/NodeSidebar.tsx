import { ArrowUpIcon, ChevronLeftCircleIcon, InfoIcon } from 'lucide-react';

import { cn } from '@/utils/theme.util';
import { categoriesDescription } from './data/category.data';

import { useNodesSearch } from './hooks/useNodesSearch.hook';
import { workflowStoreSynced } from '@/app/workflow/_store/workflow-synced.store';
import { useAppSelector } from '@/store/hook/redux.hook';

import { ButtonElement } from '@/components/elements/ButtonElement';
import { ImageElement } from '@/components/elements/ImageElement';
import { useWorkflowEditor } from '../../hooks/useWorkflowEditor.hook';
import { TooltipElement } from '@/components/elements/TooltipElement';

export default function NodeSidebar() {
	const workflow = useAppSelector((state) => state.workflowState.workflow);
	const { searchQuery, setSearchQuery, categorizedTools, isNoMatch, expandedCategories, toggleExpandedCategory } =
		useNodesSearch();
	const { isLive } = useWorkflowEditor();

	const isNodeListSidebarOpen = workflowStoreSynced((state) => state.isNodeListSidebarOpen);
	const setWSSyncedValue = workflowStoreSynced((state) => state.setWSSyncedValue);

	if (!workflow) return null;
	return (
		<div className="relative h-full w-max shrink-0 border-r-2">
			{isNodeListSidebarOpen && (
				<div className="flex h-full w-[320px] flex-col space-y-7 bg-background/10 px-4 py-6">
					<h4 className="gradient-primary-light !mt-5 bg-clip-text text-transparent">Tasks Library</h4>

					<div className="group relative w-full">
						<div className="gradient-blue-red absolute -inset-0.5 rounded-xl opacity-0 blur transition-opacity duration-300 group-focus-within:opacity-50" />
						<input
							type="text"
							placeholder="Search Tasks ..."
							value={searchQuery}
							onChange={(event) => setSearchQuery(event.target.value)}
							className="relative w-full rounded-xl border border-border bg-input p-3 placeholder-muted focus:border-transparent focus:outline-none"
						/>
					</div>

					<div className="space-y-5 overflow-auto px-2">
						{Object.keys(categorizedTools).map((category) => (
							<div key={category} className="w-full">
								<ButtonElement
									onClick={() => toggleExpandedCategory(category)}
									title={category}
									variant="wrapper"
									className="flex items-center gap-1.5 font-semibold"
								>
									<TooltipElement
										trigger={
											<InfoIcon className="size-[18px] shrink-0 fill-muted-dark stroke-background stroke-[3px]" />
										}
										content={
											<p className="w-full max-w-sm text-wrap text-start font-normal">
												{categoriesDescription[category]}
											</p>
										}
									/>
									{category}{' '}
									<ArrowUpIcon
										className={cn(
											'size-4',
											searchQuery || (!expandedCategories.includes(category) && 'rotate-180'),
										)}
									/>
								</ButtonElement>

								{(searchQuery || expandedCategories.includes(category)) && (
									<div className="mt-1.5 w-full space-y-2">
										{categorizedTools[category].map((node) => (
											<ButtonElement
												key={node.name}
												onClick={(event) => {
													event.preventDefault();
													event.stopPropagation();

													return node.onClick();
												}}
												disabled={isLive}
												title={node.description}
												variant="muted"
												className="h-max w-full justify-start gap-3 bg-light/10 py-3 text-start hover:ml-1 hover:bg-light/20"
											>
												<ImageElement
													src={node.image}
													alt={node.name}
													className="size-6 object-contain"
												/>

												<div className="w-full overflow-hidden">
													<p className="text-base font-medium">{node.name}</p>
													<p className="truncate text-muted">{node.description}</p>
												</div>
											</ButtonElement>
										))}
									</div>
								)}
							</div>
						))}

						{isNoMatch && <p className="text-center font-medium">...No matching node...</p>}
					</div>
				</div>
			)}

			<div
				className={cn(
					'absolute !my-auto size-max',
					isNodeListSidebarOpen ? 'inset-[0_-14px_0_auto]' : 'inset-[0_-32px_0_auto]',
				)}
			>
				<ButtonElement
					disabled={isLive}
					onClick={() => setWSSyncedValue({ isNodeListSidebarOpen: !isNodeListSidebarOpen })}
					title="Collapse or expand tasks library"
					variant={'ghost'}
					className="relative z-10 size-max rounded-full bg-background p-0 hover:bg-background hover:text-primary"
				>
					<ChevronLeftCircleIcon className={cn('size-7', !isNodeListSidebarOpen && 'rotate-180')} />
				</ButtonElement>

				{!isNodeListSidebarOpen && (
					<div className="absolute inset-[-9px_auto_auto_-5px] z-[9] h-12 w-1 rounded-md bg-light" />
				)}
			</div>
		</div>
	);
}
