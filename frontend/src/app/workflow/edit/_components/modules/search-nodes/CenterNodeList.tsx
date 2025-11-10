import { ArrowUpIcon, PlusIcon } from 'lucide-react';
import { FiX } from 'react-icons/fi';
import { useNodes } from '@xyflow/react';

import { cn } from '@/utils/theme.util';
import { MODAL_IDS } from '@/constants/modal.constant';
import { ReactFlowNode } from '../../types/workflow-editor.type';

import { useNodesSearch } from './hooks/useNodesSearch.hook';
import { useWorkflowEditor } from '../../hooks/useWorkflowEditor.hook';
import { useModal } from '@/providers/Modal.provider';

import { ButtonElement } from '@/components/elements/ButtonElement';
import { ImageElement } from '@/components/elements/ImageElement';

export default function CenterNodeList() {
	const { isLive } = useWorkflowEditor();
	const { activeModals, closeModal, openModal } = useModal();
	const nodes = useNodes() as ReactFlowNode[];
	const {
		expandedCategories: collapsedCategories,
		toggleExpandedCategory: toggleCollapseCategory,
		categorizedTools,
		searchQuery,
		setSearchQuery,
	} = useNodesSearch();

	const onNodeClick = (nodeAction: () => void) => {
		nodeAction();
		closeModal(MODAL_IDS.CENTER_NODE_LIST);
	};

	return (
		<div className={cn('absolute inset-0 z-10 m-auto size-max')}>
			{nodes.length === 0 && (
				<ButtonElement
					onClick={() => openModal(MODAL_IDS.CENTER_NODE_LIST)}
					title="Add node"
					variant={'muted'}
					size={'icon'}
					className="gradient-primary size-16 rounded-full p-4"
				>
					<PlusIcon className="size-full" />
				</ButtonElement>
			)}

			<div
				className={cn(
					'fixed inset-0 z-10 flex items-center justify-center bg-black/60 p-3 backdrop-blur-md',
					!activeModals.includes(MODAL_IDS.CENTER_NODE_LIST) && 'hidden',
				)}
			>
				<div
					onClick={() => closeModal(MODAL_IDS.CENTER_NODE_LIST)}
					className="absolute inset-0 size-full bg-transparent"
				/>

				<div className="relative size-full h-[90%] max-h-[768px] max-w-md rounded-xl bg-light/10 px-8 py-10">
					<ButtonElement
						onClick={() => closeModal(MODAL_IDS.CENTER_NODE_LIST)}
						variant="wrapper"
						title="Close"
						className="absolute right-4 top-4 text-muted transition-colors hover:text-foreground"
					>
						<FiX size={24} />
					</ButtonElement>

					<div className="flex size-full flex-col">
						<h4 className="gradient-primary bg-clip-text text-transparent">Add Nodes</h4>

						<div className="group relative mt-3 w-full">
							<div className="gradient-blue-red absolute -inset-0.5 rounded-xl opacity-0 blur transition-opacity duration-300 group-focus-within:opacity-50" />
							<input
								type="text"
								placeholder="Search Tasks ..."
								value={searchQuery}
								onChange={(event) => setSearchQuery(event.target.value)}
								className="relative w-full rounded-xl border border-border bg-input p-3 placeholder-muted focus:border-transparent focus:outline-none"
							/>
						</div>

						<div className="mt-8 space-y-5 overflow-auto px-1">
							{Object.keys(categorizedTools).map((category) => (
								<div key={category} className="w-full">
									<ButtonElement
										onClick={() => toggleCollapseCategory(category)}
										title={category}
										variant="wrapper"
										className="flex items-center gap-1.5 font-semibold"
									>
										{category}{' '}
										<ArrowUpIcon
											className={cn(
												'size-4',
												collapsedCategories.includes(category) && 'rotate-180',
											)}
										/>
									</ButtonElement>

									{!collapsedCategories.includes(category) && (
										<div className="mt-1.5 flex w-full flex-wrap gap-x-4 gap-y-2">
											{categorizedTools[category].map((node) => (
												<ButtonElement
													key={node.name}
													onClick={(event) => {
														event.preventDefault();
														event.stopPropagation();

														return onNodeClick(node.onClick);
													}}
													disabled={isLive}
													title={node.description}
													variant="muted"
													className="h-max w-full justify-start gap-3 bg-light/10 py-3 text-start hover:bg-light/20"
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
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
