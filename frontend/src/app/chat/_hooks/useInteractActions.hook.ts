import { FormEvent, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { v4 as uuid } from 'uuid';
import { useRouter, useSearchParams } from 'next/navigation';

import { URLS } from '@/constants/url.constant';
import { InteractType, InteractWebsocketActionsResponseType, UserInteractsType } from '../_types/interact.type';
import { WorkflowStatusType } from '@/app/workflow/_types/workflow.type';
import { CampaignAnalyticsType } from '@/app/campaign-analytics/_types/CampaignAnalytics.type';

import { useAppSelector } from '@/store/hook/redux.hook';
import { useInteract } from './useInteract.hook';
import { chatStoreSynced } from '../_store/chat-synced.store';
import { useWebSocket } from '@/providers/WebSocket.provider';
import { useCampaignAnalytics } from '@/app/campaign-analytics/_hooks/useCampaignAnalytics.hook';

export const useInteractActions = () => {
	// const { data } = useSse();
	const router = useRouter();
	const { socket } = useWebSocket();
	const user = useAppSelector((state) => state.userState.user);
	const searchParams = useSearchParams();
	const { getInteract, getUserInteracts, sendMessage } = useInteract();
	const { getCampaignAnalytics } = useCampaignAnalytics();

	const lastOpenChatId = chatStoreSynced((state) => state.lastOpenChatId);
	const setChatSyncedValue = chatStoreSynced((state) => state.setChatSyncedValue);

	const [interacts, setInteracts] = useState<UserInteractsType[]>([]);
	const [selectedInteract, setSelectedInteract] = useState<InteractType | undefined>();
	const [isSidebarOpen, setIsSidebarOpen] = useState(true);
	const [searchTerm, setSearchTerm] = useState('');
	const [currentMessage, setCurrentMessage] = useState('');
	const [tempData, setTempData] = useState<{ [key: string]: string } | undefined>(undefined);
	const [showAnalytics, setShowAnalytics] = useState(false);
	const [analytics, setAnalytics] = useState<CampaignAnalyticsType[]>([]);

	const messagesEndRef = useRef<HTMLDivElement>(null);
	const autoScrollRef = useRef<any>(null);
	const selectedInteractIdRef = useRef('');
	const lastMessageId = useRef('');

	const targetWorkflowId = searchParams.get('workflowId');

	const filteredInteracts = interacts.filter((interact) =>
		interact.workflowTitle.toLowerCase().includes(searchTerm.toLowerCase()),
	);

	const onSelectInteract = async (workflowId: string) => {
		if (!workflowId) return;

		setCurrentMessage('');
		setChatSyncedValue({ lastOpenChatId: workflowId });

		const response = await getInteract(workflowId);
		if (response.isError) return;

		selectedInteractIdRef.current = workflowId;
		setSelectedInteract(response.data);

		if (targetWorkflowId) {
			const params = new URLSearchParams(searchParams.toString());
			params.delete('workflowId');

			const newParams = params.toString();
			const newPath = newParams ? `${URLS.CHAT}?${newParams}` : URLS.CHAT;

			router.replace(`${newPath}`);
		}
	};

	const onGetUserInteracts = async () => {
		const response = await getUserInteracts();
		if (response.isError) return;

		setInteracts(response.data);

		if (targetWorkflowId) {
			const existingInteract = response.data.find((interact) => interact.workflowId === targetWorkflowId);

			if (existingInteract) {
				onSelectInteract(targetWorkflowId);
				return;
			}
		} else if (lastOpenChatId) {
			const existingInteract = response.data.find((interact) => interact.workflowId === lastOpenChatId);

			if (existingInteract) {
				onSelectInteract(existingInteract.workflowId);
				return;
			}
		} else {
			const lastInteract = response.data[response.data.length - 1];
			if (lastInteract) {
				onSelectInteract(lastInteract.workflowId);
				return;
			}
		}
	};

	const removeLastMessage = (errorMessage: string) => {
		toast.error(errorMessage);

		const existingMessages = JSON.parse(JSON.stringify(selectedInteract?.messages || []));
		const lastMessage = existingMessages[existingMessages.length - 1];

		if (lastMessage && lastMessage.id === lastMessageId.current) {
			existingMessages.pop();
		}
		setSelectedInteract((prev) => (prev ? { ...prev, messages: existingMessages } : undefined));
	};

	const onSendMessage = async (event: FormEvent) => {
		event.preventDefault();
		if (!currentMessage.trim() || !selectedInteract || !user) return;

		const data = {
			id: uuid(),
			workflowId: selectedInteract.workflowId,
			format: 'string' as const,
			content: currentMessage,
		};

		const existingMessages = selectedInteract.messages ? [...selectedInteract.messages] : [];
		existingMessages.push({
			id: data.id,
			createTime: Date.now(),
			name: `${user.firstName} ${user.lastName}`,
			username: user.username,
			format: data.format,
			content: data.content,
		});

		setSelectedInteract((prev) => (prev ? { ...prev, messages: existingMessages } : undefined));
		setCurrentMessage('');
		lastMessageId.current = data.id;

		const response = await sendMessage(data);
		if (response !== true) removeLastMessage(response);
	};

	const fetchAnalytics = async () => {
		if (!selectedInteract?.workflowId) return;

		const existingAnalytics = analytics.find((data) => data.workflow.id === selectedInteract.workflowId);
		if (existingAnalytics) return;

		const response = await getCampaignAnalytics({ workflowId: selectedInteract.workflowId });
		if (response.isError) return;

		setAnalytics((prev) => [...prev, response.data]);
	};

	useEffect(() => {
		if (!socket) return;
		onGetUserInteracts();

		socket
			.off('sendInteractMessage')
			.on('sendInteractMessage', (response: InteractWebsocketActionsResponseType<boolean>) => {
				if (response.status === 'success') return;
				removeLastMessage(response.content);
			});

		socket
			.off('updateInteractMessage')
			.on(
				'updateInteractMessage',
				(response: InteractWebsocketActionsResponseType<InteractType['messages'][number]>) => {
					if (response.status === 'failed') return;
					setSelectedInteract((prev) => {
						if (!prev) return undefined;

						const messages = JSON.parse(JSON.stringify(prev.messages));
						messages.push(response.content);
						return { ...prev, messages };
					});
				},
			);

		socket
			.off('addUserInteracts')
			.on('addUserInteracts', (response: InteractWebsocketActionsResponseType<UserInteractsType>) => {
				if (response.status === 'failed') return;
				setInteracts((prev) => {
					if (!prev) return [];

					const existingInteracts = JSON.parse(JSON.stringify(prev));
					existingInteracts.push(response.content);
					return existingInteracts;
				});
			});

		socket
			.off('deleteUserInteracts')
			.on('deleteUserInteracts', (response: InteractWebsocketActionsResponseType<string>) => {
				if (response.status === 'failed') return;

				setInteracts((prev) => prev.filter((interact) => interact.workflowId !== response.content));

				if (selectedInteractIdRef.current !== response.content) return;
				setSelectedInteract(undefined);
			});

		socket
			.off('updateInteractStatus')
			.on(
				'updateInteractStatus',
				(
					response: InteractWebsocketActionsResponseType<{ status: WorkflowStatusType; workflowId: string }>,
				) => {
					if (response.status === 'failed') return;

					setInteracts((prev) => {
						if (!prev) return [];

						const existingInteracts = JSON.parse(JSON.stringify(prev));
						const interactIndex = existingInteracts.findIndex(
							(interact: UserInteractsType) => interact.workflowId === response.content.workflowId,
						);

						if (interactIndex !== -1) {
							existingInteracts[interactIndex].status = response.content.status;
						}

						return existingInteracts;
					});

					if (selectedInteractIdRef.current !== response.content.workflowId) return;
					setSelectedInteract((prev) => (prev ? { ...prev, status: response.content.status } : undefined));
				},
			);

		socket.off('interactError').on('interactError', (response: InteractWebsocketActionsResponseType<string>) => {
			toast.error(response.content);
		});

		socket.off('showTempData').on('showTempData', (response: InteractWebsocketActionsResponseType<string>) => {
			if (response.status === 'failed') return;

			const newTempData = JSON.parse(JSON.stringify(response.content));
			setTempData(newTempData);
		});

		return () => {
			socket.off('sendInteractMessage');
			socket.off('updateInteractMessage');
			socket.off('addUserInteracts');
			socket.off('deleteUserInteracts');
			socket.off('updateInteractStatus');
			socket.off('interactError');
			socket.off('showTempData');
		};
	}, [socket]);

	useEffect(() => {
		if (!selectedInteract?.workflowId) return;

		autoScrollRef.current.scrollToBottom();
		// fetchAnalytics();
	}, [selectedInteract?.workflowId]);

	return {
		isSidebarOpen,
		setIsSidebarOpen,
		searchTerm,
		setSearchTerm,
		filteredInteracts,
		selectedInteract,
		currentMessage,
		setCurrentMessage,
		messagesEndRef,
		autoScrollRef,
		onSelectInteract,
		onSendMessage,
		tempData,
		showAnalytics,
		setShowAnalytics,
		analytics,
		fetchAnalytics,
	};
};
