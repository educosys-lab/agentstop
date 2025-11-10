import { useEffect, useMemo, useState, useRef, KeyboardEvent, MouseEvent } from 'react';
import { toast } from 'sonner';

import { MODAL_IDS } from '@/constants/modal.constant';

import { useAppDispatch, useAppSelector } from '@/store/hook/redux.hook';
import { useUser } from '@/hooks/useUser.hook';
import { userActions } from '@/store/features/user.slice';
import { useModal } from '@/providers/Modal.provider';

export const useFileList = () => {
	const dispatch = useAppDispatch();
	const { updateUser, deleteUserFile } = useUser();
	const { openModal, closeModal, activeModals } = useModal();
	const userFiles = useAppSelector((state) => state.userState.files) || [];

	const [searchQuery, setSearchQuery] = useState('');
	const [isDropdownOpen, setIsDropdownOpen] = useState<string | null>(null);
	const [editingFileId, setEditingFileId] = useState<string | null>(null);
	const [editFileName, setEditFileName] = useState('');
	const [fileExtension, setFileExtension] = useState('');
	const [fileToDelete, setFileToDelete] = useState<string | null>(null);

	const inputRef = useRef<HTMLInputElement>(null);

	const filteredFiles = useMemo(() => {
		if (!searchQuery) return userFiles;
		return userFiles.filter((file) => file.fileName.toLowerCase().includes(searchQuery.toLowerCase()));
	}, [searchQuery, userFiles]);

	const updateFileName = async (fileId: string, newName: string) => {
		const targetFile = userFiles.find((file) => file.id === fileId);
		if (!targetFile) {
			toast.error('File not found!');
			return false;
		}

		const updateUserData = await updateUser({
			files: [
				{
					id: targetFile.id,
					fileName: `${newName}.${fileExtension}`,
					originalFileName: targetFile.originalFileName,
					url: targetFile.url,
					uploadTime: targetFile.uploadTime,
				},
			],
		});
		if (updateUserData.isError) {
			toast.error(updateUserData.message);
			return false;
		}

		const { ssoConfig, ...rest } = updateUserData.data;
		dispatch(userActions.setValue({ user: rest, ssoConfig, lastSynced: Date.now() }));
		toast.success('File name updated successfully');
		return true;
	};

	const toggleDropdown = (event: MouseEvent, fileId: string) => {
		event.stopPropagation();
		setIsDropdownOpen((prev) => (prev === fileId ? null : fileId));
	};

	const onRenameFile = (fileId: string, currentName: string) => {
		setEditingFileId(fileId);
		setFileExtension(currentName.split('.').pop() || '');
		setEditFileName(currentName.split('.').slice(0, -1).join('.'));
		setIsDropdownOpen(null);
		setTimeout(() => inputRef.current?.focus(), 0);
	};

	const saveFileName = async (fileId: string) => {
		if (!editFileName.trim()) {
			toast.error('File name cannot be empty!');
			setEditingFileId(null);
			return;
		}

		const isUpdated = await updateFileName(fileId, editFileName);
		if (!isUpdated) return;

		setEditingFileId(null);
		setEditFileName('');
	};

	const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>, fileId: string) => {
		if (event.key === 'Enter') {
			event.preventDefault();
			saveFileName(fileId);
		}
	};

	const handleDeleteClick = (event: MouseEvent, fileId: string) => {
		event.stopPropagation();
		setFileToDelete(fileId);
		openModal(MODAL_IDS.DELETE_FILE);
	};

	const handleDeleteConfirm = async () => {
		if (!fileToDelete) return;
		const response = await deleteUserFile(fileToDelete);

		if (response.isError) {
			toast.error(response?.message || 'Error deleting mission!');
			return;
		}

		dispatch(userActions.setValue({ files: userFiles.filter((item) => item.id !== fileToDelete) }));
		setFileToDelete(null);
		closeModal(MODAL_IDS.DELETE_FILE);
		setIsDropdownOpen(null);
		toast.success('File deleted successfully!');
	};

	const handleDeleteCancel = () => {
		setFileToDelete(null);
		closeModal(MODAL_IDS.DELETE_FILE);
	};

	useEffect(() => {
		const handleClickOutside = (event: globalThis.MouseEvent) => {
			if (!(event.target as Element)?.closest('.dropdown-container')) {
				setIsDropdownOpen(null);
			}
		};
		document.addEventListener('click', handleClickOutside);
		return () => document.removeEventListener('click', handleClickOutside);
	}, []);

	return {
		searchQuery,
		setSearchQuery,
		filteredFiles,
		isDropdownOpen,
		toggleDropdown,
		editingFileId,
		editFileName,
		setEditFileName,
		onRenameFile,
		saveFileName,
		handleKeyDown,
		handleDeleteClick,
		handleDeleteConfirm,
		handleDeleteCancel,
		activeModals,
		inputRef,
	};
};
