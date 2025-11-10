'use client';

import { motion } from 'framer-motion';
import { FiMoreVertical, FiX } from 'react-icons/fi';
import ReactPlayer from 'react-player';
import { Dispatch, SetStateAction, useState } from 'react';

import { cardVariants } from '@/app/(landing-page)/_utils/framer-variant';
import { URLS } from '@/constants/url.constant';
import { MODAL_IDS } from '@/constants/modal.constant';

import { useFileList } from '../../_hooks/useFileList.hook';
import { useAppSelector } from '@/store/hook/redux.hook';

import { LinkElement } from '@/components/elements/LinkElement';
import { ButtonElement } from '@/components/elements/ButtonElement';
import { InputElement } from '@/components/elements/InputElement';
import { PlusIcon } from 'lucide-react';
import { SelectElement } from '@/components/elements/SelectElement';

type FileListPropsType = {
	fileMetadata: Record<string, any> | null;
	setFileMetadata: Dispatch<SetStateAction<Record<string, any> | null>>;
	columnNumber: number;
	setColumnNumber: Dispatch<SetStateAction<number>>;
	onCloseMappingModal: () => void;
	onConfirmMappingModal: () => void;
};

const columns = [
	{ label: 'Name', value: 'name' },
	{ label: 'Email', value: 'email' },
	{ label: 'Phone', value: 'phone' },
	{ label: 'Custom', value: 'custom' },
];

export default function FileList({
	fileMetadata,
	setFileMetadata,
	columnNumber,
	setColumnNumber,
	onCloseMappingModal,
	onConfirmMappingModal,
}: FileListPropsType) {
	const view = useAppSelector((state) => state.dashboardState.view);
	const {
		searchQuery,
		setSearchQuery,
		filteredFiles,
		isDropdownOpen,
		toggleDropdown,
		editingFileId,
		editFileName,
		setEditFileName,
		onRenameFile,
		handleKeyDown,
		handleDeleteClick,
		handleDeleteConfirm,
		handleDeleteCancel,
		activeModals,
		inputRef,
		saveFileName,
	} = useFileList();

	const [customColumnIndex, setCustomColumnIndex] = useState<number[]>([]);

	return (
		<>
			<div className="mx-auto w-full grow bg-background-dark px-3 pb-12">
				{filteredFiles.length > 0 && (
					<div className="mb-12 mt-8 flex justify-center">
						<div className="group relative w-full max-w-2xl">
							<div className="gradient-blue-red absolute -inset-0.5 rounded-xl opacity-0 blur transition-opacity duration-300 group-focus-within:opacity-50" />
							<input
								type="text"
								placeholder="Search files..."
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
					{filteredFiles.length === 0 ? (
						<div className="col-span-full flex flex-col items-center justify-center pb-12 text-center">
							<ReactPlayer
								url={`${URLS.VIDEOS}/logoHappyAnimation.webm`}
								playing
								loop
								muted
								className="h-20"
							/>
							<p className="text-xl text-muted">No files found...</p>
						</div>
					) : (
						filteredFiles.map((file, index) => (
							<motion.div
								key={file.id}
								variants={cardVariants}
								initial="hidden"
								animate="visible"
								whileHover="hover"
								whileTap="tap"
								custom={index}
							>
								<div
									className={`group relative block h-full border border-border transition-all duration-300 hover:border-border ${
										view === 'grid'
											? 'rounded-xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-6 shadow-2xl hover:from-gray-800 hover:to-gray-900'
											: 'flex items-center justify-between rounded-xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-6 shadow-xl hover:from-gray-800 hover:to-gray-900'
									}`}
								>
									<div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-600/10 opacity-0 transition-opacity group-hover:opacity-100" />

									<div className={`${view === 'grid' ? 'space-y-4' : 'flex-1'}`}>
										<div className="flex items-center justify-between gap-5">
											{editingFileId === file.id ? (
												<input
													ref={inputRef}
													type="text"
													value={editFileName}
													onChange={(e) => setEditFileName(e.target.value)}
													onKeyDown={(e) => handleKeyDown(e, file.id)}
													onBlur={() => saveFileName(file.id)}
													onClick={(e) => e.stopPropagation()}
													className="max-w-[50%] rounded-md border border-border bg-gray-800 px-2 py-1 text-xl font-semibold text-foreground focus:border-primary focus:outline-none"
												/>
											) : (
												<h3 className="gradient-primary-light truncate bg-clip-text text-xl font-semibold text-transparent">
													{file.fileName}
												</h3>
											)}

											<div className="flex items-center gap-2">
												<div className="dropdown-container relative">
													<button
														title="More options"
														onClick={(event) => toggleDropdown(event, file.id)}
														className="flex size-9 items-center justify-center rounded-lg backdrop-blur-sm hover:bg-gray-700/50"
													>
														<FiMoreVertical size={18} className="text-primary-light" />
													</button>
													{isDropdownOpen === file.id && (
														<div className="absolute right-0 z-10 mt-2 w-40 rounded-md bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5">
															<div className="py-1">
																<LinkElement
																	title="Edit file name"
																	onClick={(event) => {
																		event.stopPropagation();
																		onRenameFile(file.id, file.fileName);
																	}}
																	className="block px-4 py-2 text-sm text-primary-light hover:bg-gray-700"
																>
																	Rename
																</LinkElement>
																<LinkElement
																	title="Delete file"
																	onClick={(event) =>
																		handleDeleteClick(event, file.id)
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
									</div>
								</div>
							</motion.div>
						))
					)}
				</div>
			</div>

			{activeModals.includes(MODAL_IDS.DELETE_FILE) && (
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
								Delete File
							</h2>
							<p className="mt-4 text-muted">
								Are you sure you want to delete this file? This action cannot be undone.
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

			{activeModals.includes(MODAL_IDS.FILE_METADATA) && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md">
					<motion.div
						initial={{ scale: 0.9, opacity: 0 }}
						animate={{ scale: 1, opacity: 1 }}
						exit={{ scale: 0.9, opacity: 0 }}
						transition={{ duration: 0.3, ease: 'easeInOut' }}
						className="relative max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-2xl border border-border bg-gradient-to-br from-gray-900 to-gray-800 p-8 shadow-xl"
					>
						<ButtonElement
							onClick={onCloseMappingModal}
							variant="wrapper"
							title="Close"
							className="absolute right-4 top-4 text-muted transition-colors hover:text-foreground"
						>
							<FiX size={24} />
						</ButtonElement>

						<div className="mb-8 text-center">
							<h2 className="gradient-primary-light bg-clip-text text-3xl font-bold text-transparent">
								Column Mapping
							</h2>
							<p className="mt-4 text-muted">Please describe the columns of the spreadsheet.</p>
						</div>

						<div className="flex flex-col gap-2">
							{Array.from({ length: columnNumber }).map((_, index) => (
								<div key={index} className="flex items-center gap-2">
									<p className="mr-1 w-20 shrink-0 text-nowrap">Column {index + 1}</p>

									<SelectElement
										value={
											customColumnIndex.includes(index)
												? 'custom'
												: fileMetadata
													? fileMetadata[`Column ${index + 1}`]
													: undefined
										}
										onChange={(value) => {
											if (value === 'custom') {
												setCustomColumnIndex((prev) => [...prev, index]);
												setFileMetadata((prev) => ({
													...prev,
													[`Column ${index + 1}`]: '',
												}));
											} else {
												setCustomColumnIndex((prev) => prev.filter((item) => item !== index));
												setFileMetadata((prev) => ({
													...prev,
													[`Column ${index + 1}`]: value,
												}));
											}
										}}
										triggerText="Select type"
										content={columns}
										triggerClassName="py-2.5"
										containerClassName="w-full"
									/>
									{customColumnIndex.includes(index) && (
										<InputElement
											value={fileMetadata ? fileMetadata[`Column ${index + 1}`] : ''}
											onChange={(event) =>
												setFileMetadata((prev) => ({
													...prev,
													[`Column ${index + 1}`]: event.target.value,
												}))
											}
											placeholder={`Column ${index + 1}`}
											className="grow"
										/>
									)}
								</div>
							))}

							<ButtonElement
								onClick={() => setColumnNumber((prev) => prev + 1)}
								title="Add Column"
								variant="primary"
								size={'icon'}
								className={'ml-auto'}
							>
								<PlusIcon className="size-5" />
							</ButtonElement>
						</div>

						<div className="mt-10 flex justify-center gap-4">
							<motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
								<ButtonElement
									onClick={onCloseMappingModal}
									variant="wrapper"
									className="rounded-xl border border-border bg-gray-800 px-6 py-3 font-semibold text-foreground hover:bg-gray-700"
									title="Cancel"
								>
									Cancel
								</ButtonElement>
							</motion.div>
							<motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
								<ButtonElement
									onClick={onConfirmMappingModal}
									variant="wrapper"
									className="gradient-primary rounded-xl px-6 py-3 font-semibold text-white"
									title="Confirm"
								>
									Save
								</ButtonElement>
							</motion.div>
						</div>
					</motion.div>
				</div>
			)}
		</>
	);
}
