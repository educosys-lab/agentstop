'use client';

import { useRef, useState } from 'react';
import { FiPlus } from 'react-icons/fi';
import { toast } from 'sonner';

import { cn } from '@/utils/theme.util';
import { MODAL_IDS } from '@/constants/modal.constant';

import { useModal } from '@/providers/Modal.provider';
import { useAws } from '@/hooks/useAws.hook';

import { ButtonElement } from '@/components/elements/ButtonElement';
import WorkflowList from './WorkflowList';
import FileList from './FileList';
import { Loader } from '@/components/elements/LoaderElement';

export default function List() {
	const { openModal, closeModal } = useModal();
	const { uploadData } = useAws();

	const [activeList, setActiveList] = useState<'workflow' | 'files'>('workflow');
	const [fileMetadata, setFileMetadata] = useState<Record<string, any> | null>(null);
	const [file, setFile] = useState<File | null>(null);
	const [columnNumber, setColumnNumber] = useState(1);
	const [isLoading, setIsLoading] = useState(false);

	const inputRef = useRef<HTMLInputElement>(null);

	const checkFileForUpload = async (fileData: File) => {
		setIsLoading(true);
		const fileExtension = fileData.name.split('.').pop() || '';
		if (['xls', 'xlsx', 'csv'].includes(fileExtension) && fileMetadata === null) {
			openModal(MODAL_IDS.FILE_METADATA);
			setIsLoading(false);
			return;
		}

		await uploadData({ file: fileData, fileMetadata });
		setFileMetadata(null);
		setIsLoading(false);
	};

	const confirmFileUpload = async () => {
		if (!file) {
			toast.error('Please select a file!');
			return;
		}

		await uploadData({ file, fileMetadata });
		setFileMetadata(null);
	};

	const onCloseMappingModal = () => {
		setColumnNumber(1);
		setFileMetadata(null);
		closeModal(MODAL_IDS.FILE_METADATA);
	};

	const onConfirmMappingModal = async () => {
		setIsLoading(true);
		await confirmFileUpload();
		setColumnNumber(1);
		closeModal(MODAL_IDS.FILE_METADATA);
		setIsLoading(false);
	};

	return (
		<>
			<div className="size-full grow bg-background-dark">
				<div className="mx-auto flex max-w-7xl items-center justify-between px-6 pb-8 pt-24">
					<div>
						<ButtonElement
							onClick={() => setActiveList('workflow')}
							title="Mission"
							variant={'wrapper'}
							className={cn('text-2xl font-bold sm:text-3xl', activeList !== 'workflow' && 'opacity-25')}
						>
							Your Missions
						</ButtonElement>
						<span className="text-2xl font-bold sm:text-3xl"> / </span>
						<ButtonElement
							onClick={() => setActiveList('files')}
							title="Files"
							variant={'wrapper'}
							className={cn('text-2xl font-bold sm:text-3xl', activeList !== 'files' && 'opacity-25')}
						>
							Your Files
						</ButtonElement>
					</div>

					<div className="relative">
						<ButtonElement
							onClick={() => openModal(MODAL_IDS.NEW_WORKFLOW)}
							title="New"
							variant={'wrapper'}
							className="gradient-primary hidden items-center gap-2 whitespace-nowrap rounded-lg px-4 py-2 transition-transform hover:scale-105 tablet:flex"
						>
							<FiPlus size={20} /> {activeList === 'workflow' ? 'New Mission' : 'Upload File'}
						</ButtonElement>
						<ButtonElement
							onClick={() => openModal(MODAL_IDS.NEW_WORKFLOW)}
							title="New"
							variant={'wrapper'}
							className="gradient-primary flex items-center gap-2 whitespace-nowrap rounded-lg px-4 py-2 transition-transform hover:scale-105 tablet:hidden"
						>
							<FiPlus size={20} /> {activeList === 'workflow' ? 'New' : 'Upload'}
						</ButtonElement>

						<input
							ref={inputRef}
							onChange={(event) => {
								const fileData = event.target.files?.[0];
								if (!fileData) return;

								setFile(fileData);
								checkFileForUpload(fileData);
								if (inputRef.current) inputRef.current.value = '';
							}}
							type="file"
							className={cn(
								activeList === 'workflow'
									? 'hidden'
									: 'absolute inset-0 size-full cursor-pointer opacity-0',
							)}
						/>
					</div>
				</div>

				{activeList === 'workflow' && <WorkflowList />}
				{activeList === 'files' && (
					<FileList
						fileMetadata={fileMetadata}
						setFileMetadata={setFileMetadata}
						columnNumber={columnNumber}
						setColumnNumber={setColumnNumber}
						onCloseMappingModal={onCloseMappingModal}
						onConfirmMappingModal={onConfirmMappingModal}
					/>
				)}
			</div>

			{isLoading && (
				<div className="fixed inset-[auto_0_30px_0] z-[100] mx-auto flex w-max items-center gap-2 rounded-lg bg-primary/50 p-4">
					<Loader />
					<span>File is uploading...</span>
				</div>
			)}
		</>
	);
}
