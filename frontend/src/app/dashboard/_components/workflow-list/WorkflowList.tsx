'use client';

import { motion } from 'framer-motion';
import { FiEdit, FiMoreVertical, FiX } from 'react-icons/fi';
import { formatDateTime } from '@sgx4u/date-time-utils';
import { toast } from 'sonner';
import { MessageSquareMoreIcon } from 'lucide-react';
import ReactPlayer from 'react-player';

import { cn } from '@/utils/theme.util';
import { cardVariants } from '@/app/(landing-page)/_utils/framer-variant';
import { URLS } from '@/constants/url.constant';
import { MODAL_IDS } from '@/constants/modal.constant';

import { useWorkflowList } from '../../_hooks/useWorkflowList.hook';
import { useAppSelector } from '@/store/hook/redux.hook';

import { LinkElement } from '@/components/elements/LinkElement';
import { ButtonElement } from '@/components/elements/ButtonElement';
import MissionExecutionCount from '@/app/_components/plan/MissionExecutionCount';
import MonthlyLimit from '../../../_components/plan/MonthlyLimit';

export default function WorkflowList() {
	const user = useAppSelector((state) => state.userState.user);
	const view = useAppSelector((state) => state.dashboardState.view);
	const {
		searchQuery,
		setSearchQuery,
		filteredWorkflows,
		isDropdownOpen,
		toggleDropdown,
		editingWorkflowId,
		editTitle,
		setEditTitle,
		onRenameWorkflow,
		handleKeyDown,
		handleDeleteClick,
		handleDeleteConfirm,
		handleDeleteCancel,
		activeModals,
		inputRef,
		saveTitle,
	} = useWorkflowList();

	return (
		<>
			<div className="mx-auto w-full grow bg-background-dark px-3 pb-12">
				{!user?.isAdmin && (
					<>
						<MissionExecutionCount />
						<MonthlyLimit />
					</>
				)}

				{filteredWorkflows.length > 0 && (
					<div className="mb-12 mt-8 flex justify-center">
						<div className="group relative w-full max-w-2xl">
							<div className="gradient-blue-red absolute -inset-0.5 rounded-xl opacity-0 blur transition-opacity duration-300 group-focus-within:opacity-50" />
							<input
								type="text"
								placeholder="Search missions..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="relative w-full rounded-xl border border-border bg-input px-6 py-3 text-lg text-foreground placeholder-muted focus:border-transparent focus:outline-none"
							/>
						</div>
					</div>
				)}

				<div
					className={`mx-auto max-w-7xl gap-4 ${view === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'flex flex-col'}`}
				>
					{filteredWorkflows.length === 0 ? (
						<div className="col-span-full flex flex-col items-center justify-center pb-12 text-center">
							<ReactPlayer
								url={`${URLS.VIDEOS}/logoHappyAnimation.webm`}
								playing
								loop
								muted
								className="h-20"
							/>
							<p className="text-xl text-muted">No missions found...</p>
						</div>
					) : (
						filteredWorkflows.map((workflow, index) => (
							<motion.div
								key={workflow.id}
								variants={cardVariants}
								initial="hidden"
								animate="visible"
								whileHover="hover"
								whileTap="tap"
								custom={index}
							>
								<div
									// onClick={() => router.push(`${URLS.WORKFLOW_METRICS}?workflowId=${workflow.id}`)}
									className={`group relative block h-full border border-border transition-all duration-300 hover:border-border ${
										view === 'grid'
											? 'rounded-xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-6 shadow-2xl hover:from-gray-800 hover:to-gray-900'
											: 'flex items-center justify-between rounded-xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-6 shadow-xl hover:from-gray-800 hover:to-gray-900'
									}`}
								>
									<div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-600/10 opacity-0 transition-opacity group-hover:opacity-100" />

									<div
										className={cn(
											'absolute inset-[8px_auto_auto_8px] size-3 rounded-full',
											workflow.status === 'live' ? 'bg-success' : 'bg-muted',
										)}
									/>

									<div className={`${view === 'grid' ? 'space-y-4' : 'flex-1'}`}>
										<div className="flex items-center justify-between gap-5">
											{editingWorkflowId === workflow.id ? (
												<input
													ref={inputRef}
													type="text"
													value={editTitle}
													onChange={(e) => setEditTitle(e.target.value)}
													onKeyDown={(e) => handleKeyDown(e, workflow.id)}
													onBlur={() => saveTitle(workflow.id)}
													onClick={(e) => e.stopPropagation()}
													className="text-foregroundfocus:border-primary max-w-[50%] rounded-md border border-border bg-gray-800 px-2 py-1 text-xl font-semibold focus:outline-none"
												/>
											) : (
												<h3 className="gradient-primary-light truncate bg-clip-text text-xl font-semibold text-transparent">
													{workflow.title}
												</h3>
											)}

											<div className="flex items-center gap-2">
												<LinkElement
													title="Go to mission chat"
													href={`${URLS.CHAT}?workflowId=${workflow.id}`}
													onClick={(event) => event.stopPropagation()}
													target="_blank"
													rel="noopener noreferrer"
													className="flex size-9 items-center justify-center rounded-lg pt-1 backdrop-blur-sm hover:bg-gray-700/50"
												>
													<MessageSquareMoreIcon size={18} className="text-primary-light" />
												</LinkElement>

												<LinkElement
													title="Edit Mission"
													href={`${URLS.WORKFLOW_EDIT}?workflowId=${workflow.id}`}
													onClick={(event) => event.stopPropagation()}
													className="flex size-9 items-center justify-center rounded-lg backdrop-blur-sm hover:bg-gray-700/50"
												>
													<FiEdit size={18} className="text-primary-light" />
												</LinkElement>

												<div className="dropdown-container relative">
													<button
														title="More options"
														onClick={(event) => toggleDropdown(event, workflow.id)}
														className="flex size-9 items-center justify-center rounded-lg backdrop-blur-sm hover:bg-gray-700/50"
													>
														<FiMoreVertical size={18} className="text-primary-light" />
													</button>
													{isDropdownOpen === workflow.id && (
														<div className="absolute right-0 z-10 mt-2 w-40 rounded-md bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5">
															<div className="py-1">
																<LinkElement
																	title="Edit mission name"
																	onClick={(event) => {
																		event.stopPropagation();
																		if (workflow.status === 'live') {
																			toast.error(
																				'Please make the mission offline to edit!',
																			);
																			return;
																		}
																		onRenameWorkflow(workflow.id, workflow.title);
																	}}
																	className="block px-4 py-2 text-sm text-primary-light hover:bg-gray-700"
																>
																	Rename
																</LinkElement>
																<LinkElement
																	title="Delete mission"
																	onClick={(event) =>
																		handleDeleteClick(event, workflow.id)
																	}
																	className="block px-4 py-2 text-sm text-destructive hover:bg-gray-700"
																>
																	Delete
																</LinkElement>
															</div>
														</div>
													)}
												</div>
											</div>
										</div>

										<div className={`flex flex-col gap-1 text-sm text-muted`}>
											<p>
												Created :{' '}
												<span className="text-base font-medium text-blue-300">
													{formatDateTime({
														date: workflow.createTime,
														format: 'EEE, dd MMM yyyy, HH:mm:ss',
													})}
												</span>
											</p>
											<p>
												Modified :{' '}
												<span className="text-base font-medium text-purple-300">
													{formatDateTime({
														date: workflow.updateTime,
														format: 'EEE, dd MMM yyyy, HH:mm:ss',
													})}
												</span>
											</p>

											<p className="space-x-1">
												<span>Success :</span>
												<span className="text-base font-medium text-blue-300">
													{workflow.report.successExecutions}
												</span>

												<span className="!ml-16">Failed :</span>
												<span className="text-base font-medium text-blue-300">
													{workflow.report.failedExecutions}
												</span>
											</p>
										</div>
									</div>
								</div>
							</motion.div>
						))
					)}
				</div>
			</div>

			{activeModals.includes(MODAL_IDS.DELETE_WORKFLOW) && (
				<div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-md">
					<motion.div
						initial={{ scale: 0.9, opacity: 0 }}
						animate={{ scale: 1, opacity: 1 }}
						exit={{ scale: 0.9, opacity: 0 }}
						transition={{ duration: 0.3, ease: 'easeInOut' }}
						className="relative w-full max-w-md rounded-2xl border border-border bg-gradient-to-br from-gray-900 to-gray-800 p-8 shadow-xl"
					>
						<ButtonElement
							onClick={handleDeleteCancel}
							variant="wrapper"
							title="Close"
							className="absolute right-4 top-4 text-muted transition-colors hover:text-foreground"
						>
							<FiX size={24} />
						</ButtonElement>

						<div className="mb-8 text-center">
							<h2 className="gradient-primary-light bg-clip-text text-3xl font-bold text-transparent">
								Delete Mission
							</h2>
							<p className="mt-4 text-muted">
								Are you sure you want to delete this mission? This action cannot be undone.
							</p>
						</div>

						<div className="flex justify-center gap-4">
							<motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
								<ButtonElement
									onClick={handleDeleteCancel}
									variant="wrapper"
									className="rounded-xl border border-border bg-gray-800 px-6 py-3 font-semibold text-foreground hover:bg-gray-700"
									title="Cancel"
								>
									Cancel
								</ButtonElement>
							</motion.div>
							<motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
								<ButtonElement
									onClick={handleDeleteConfirm}
									variant="wrapper"
									className="gradient-primary rounded-xl px-6 py-3 font-semibold text-white"
									title="Delete"
								>
									Delete
								</ButtonElement>
							</motion.div>
						</div>
					</motion.div>
				</div>
			)}
		</>
	);
}
