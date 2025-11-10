import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { api } from '@/services/axios.service';
import { URLS } from '@/constants/url.constant';
import { MODAL_IDS } from '@/constants/modal.constant';
import { AxiosResult } from '@/types/axios.type';
import { AddTemplateType } from '../_types/template.type';

import { workflowStoreSynced } from '@/app/workflow/_store/workflow-synced.store';
import { useAppSelector } from '@/store/hook/redux.hook';
import { useModal } from '@/providers/Modal.provider';
import { localStorageService } from '@/services/local-storage.service';

export const useTemplate = () => {
	const router = useRouter();
	const user = useAppSelector((state) => state.userState.user);
	const { openModal } = useModal();

	const allTemplates = workflowStoreSynced((state) => state.workflowTemplates) || [];

	const [searchQuery, setSearchQuery] = useState('');
	const [selectedCategory, setSelectedCategory] = useState('');
	const [selectedSubCategory, setSelectedSubCategory] = useState('');
	const [expandedCategory, setExpandedCategory] = useState<string[]>([]);
	const [isSidebarOpen, setIsSidebarOpen] = useState(false);

	const allCategories = allTemplates.reduce(
		(acc, template) => {
			if (!acc[template.category]) acc[template.category] = [];
			if (!acc[template.category].includes(template.subCategory)) {
				acc[template.category].push(template.subCategory);
			}
			return acc;
		},
		{} as { [category: string]: string[] },
	);

	const filteredTemplates =
		searchQuery.trim() || selectedCategory
			? allTemplates.filter((template) => {
					const query = searchQuery.toLowerCase();

					return (
						(template.title.toLowerCase().includes(query) ||
							template.category.toLowerCase().includes(query) ||
							template.notes.toLowerCase().includes(query)) &&
						(selectedCategory
							? template.category.toLowerCase() === selectedCategory.toLowerCase()
							: true) &&
						(selectedSubCategory
							? template.subCategory.toLowerCase() === selectedSubCategory.toLowerCase()
							: true)
					);
				})
			: allTemplates;

	const addTemplate = async (template: AddTemplateType) => {
		let result: AxiosResult<boolean>;

		try {
			const response = await api.post<boolean>(`${URLS.API}/template`, template);
			result = { data: response.data, isError: false, message: '' };
			toast.success('Template added successfully!');
		} catch (error) {
			const message = (error as any).response?.data?.message || 'Error adding template!';
			result = { data: null, isError: true, message };
			console.error('Error adding template!', error);
			toast.error('Error adding template!');
		}

		return result;
	};

	const onCreateMissionFromTemplate = async (templateId: string) => {
		if (!user) {
			localStorageService.set('templateId', templateId);
			openModal(MODAL_IDS.SIGNIN);
			return;
		}

		let result: AxiosResult<string>;

		try {
			const response = await api.post<string>(`${URLS.API}/template/use?id=${templateId}`);
			result = { data: response.data, isError: false, message: '' };
			toast.success('Mission created successfully!');
			router.push(`${URLS.WORKFLOW_EDIT}?workflowId=${response.data}`);
		} catch (error) {
			const message = (error as any).response?.data?.message || 'Mission creation failed!';
			result = { data: null, isError: true, message };
			console.error('Mission creation failed!', error);
			toast.error('Mission creation failed!');
		}

		return result;
	};

	useEffect(() => {
		const handleResize = () => {
			if (window.innerWidth >= 1024) setIsSidebarOpen(false);
		};

		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	}, []);

	return {
		searchQuery,
		setSearchQuery,
		allCategories,
		selectedCategory,
		setSelectedCategory,
		selectedSubCategory,
		setSelectedSubCategory,
		filteredTemplates,
		expandedCategory,
		setExpandedCategory,
		isSidebarOpen,
		setIsSidebarOpen,
		addTemplate,
		onCreateMissionFromTemplate,
	};
};
