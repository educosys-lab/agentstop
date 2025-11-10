import { useState, useEffect, useMemo, ChangeEvent } from 'react';

import { api } from '@/services/axios.service';
import { AxiosResult } from '@/types/axios.type';
import {
	AdminRole,
	Announcement,
	Metric,
	ModalContent,
	ModalType,
	User,
	Workflow,
	FormData,
} from '../_types/admin.type';
import {
	announcementData,
	matrixData,
	userData,
	workflowsData,
	rolesConfigData,
	adminRolesData,
} from '../_data/admin.data';
import { URLS } from '@/constants/url.constant';
import { LogType } from '../logs/page';

import { useModal } from '@/providers/Modal.provider';

export const useAdmin = () => {
	const { openModal, closeModal } = useModal();

	const [currentRole, setCurrentRole] = useState('Super Admin');
	const [currentView, setCurrentView] = useState(rolesConfigData['Super Admin'].nav[0].name);
	const [isSidebarOpen, setIsSidebarOpen] = useState(true);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [modalContent, setModalContent] = useState<ModalContent>({
		modalId: '',
		title: '',
		type: null,
		modalWidth: 'md',
		modalDescription: 'Manage settings or perform actions.',
	});
	const [formData, setFormData] = useState<FormData>({});
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [metrics, setMetrics] = useState<Metric>(matrixData);
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [users, setUsers] = useState<User[]>(userData);
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [workflows, setWorkflows] = useState<Workflow[]>(workflowsData);
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [announcements, setAnnouncements] = useState<Announcement[]>(announcementData);
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [adminRoles, setAdminRoles] = useState<AdminRole[]>(adminRolesData);

	const navigationItems = useMemo(() => rolesConfigData[currentRole].nav, [currentRole]);

	const handleFormChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
		setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
	};

	const onOpenModal = (
		title: string,
		type: ModalType,
		modalId: string,
		initialData: FormData = {},
		modalWidth: ModalContent['modalWidth'] = 'md',
		modalDescription: string = 'Manage settings or perform actions.',
		onOpenModal?: () => void,
	) => {
		setModalContent({ modalId, title, type, modalWidth, modalDescription });
		setFormData(initialData);
		setIsModalOpen(true);
		openModal(modalId, onOpenModal);
	};

	const onCloseModal = () => {
		setIsModalOpen(false);
		setFormData({});
		closeModal(modalContent.modalId);
		setModalContent({
			modalId: '',
			title: '',
			type: null,
			modalWidth: 'md',
			modalDescription: 'Manage settings or perform actions.',
		});
	};

	const handleModalSubmit = () => {
		onCloseModal();
	};

	const setCron = async (cronName: string, cronExpression: string) => {
		let result: AxiosResult<boolean>;
		try {
			const response = await api.post<boolean>(`${URLS.API}/admin/cron`, {
				cronName,
				cronExpression,
			});
			result = { data: response.data, isError: false, message: '' };
		} catch (error) {
			const message = (error as any).response?.data?.message || 'Error occurred!';
			result = { data: null, isError: true, message };
			console.error('Error setting cron expression:', error);
		}
		return result;

		// ===== Cron expression format =====
		// The 5 fields are: minute hour day-of-month month day-of-week
		// All expressions use 24-hour time
		// */N → every N units

		// Examples:
		// 1	Every minute	                          * * * * *
		// 2	Every 5 minutes	                          */5 * * * *
		// 3	Every 10 minutes	                      */10 * * * *
		// 4	Every 15 minutes	                      */15 * * * *
		// 5	Every 30 minutes	                      */30 * * * *
		// 6	Every hour	                              0 * * * *
		// 7	Every 3 hours	                          0 */3 * * *
		// 8	Every 6 hours	                          0 */6 * * *
		// 9	Every 12 hours	                          0 */12 * * *
		// 10	Every day (midnight)	                  0 0 * * *
		// 11	Every week (Sunday midnight)	          0 0 * * 0
		// 12	Every month (1st day)	                  0 0 1 * *
		// 13	Every quarter (Jan, Apr, Jul, Oct 1st)	  0 0 1 1,4,7,10 *
		// 14	Every half year (Jan, Jul 1st)	          0 0 1 1,7 *
		// 15	Every year (Jan 1st)	                  0 0 1 1 *
	};

	const getLogs = async () => {
		let result: AxiosResult<LogType>;

		try {
			const response = await api.get<LogType>(`${URLS.API}/admin/logs`);
			result = { data: response.data, isError: false, message: '' };
		} catch (error) {
			const message = (error as any).response?.data?.message || 'Error occurred!';
			console.error(message);
			result = { data: null, isError: true, message };
		}

		return result;
	};

	const deleteLogs = async (path: string) => {
		let result: AxiosResult<LogType>;

		try {
			const response = await api.delete<LogType>(`${URLS.API}/admin/logs?path=${path}`);
			result = { data: response.data, isError: false, message: '' };
		} catch (error) {
			const message = (error as any).response?.data?.message || 'Error occurred!';
			console.error(message);
			result = { data: null, isError: true, message };
		}

		return result;
	};

	const commonActions = [
		{
			key: 'filter',
			icon: 'Filter',
			label: 'Filter',
			onClick: () => {},
		},
		{
			key: 'export',
			icon: 'Download',
			label: 'Export Page Data',
			onClick: () => {},
		},
	];

	useEffect(() => {
		if (!navigationItems.find((item) => item.name === currentView)) {
			setCurrentView(navigationItems[0].name);
		}
	}, [currentRole, navigationItems, currentView]);

	return {
		currentRole,
		setCurrentRole,
		currentView,
		setCurrentView,
		isSidebarOpen,
		setIsSidebarOpen,
		isModalOpen,
		modalContent,
		formData,
		metrics,
		users,
		workflows,
		announcements,
		adminRoles,
		navigationItems,
		handleFormChange,
		onOpenModal,
		onCloseModal,
		handleModalSubmit,
		setCron,
		getLogs,
		deleteLogs,
		commonActions,
	};
};
