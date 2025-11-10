'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAppSelector } from '@/store/hook/redux.hook';
import { WhatsAppContactType, WhatsAppMessageType } from '../_types/whatsapp-campaign.type';
import { useWebSocket } from '@/providers/WebSocket.provider';

const formatTime = (timestamp: number): string => {
	const date = new Date(timestamp);
	return date.toLocaleTimeString('en-IN', { hour12: false, hour: '2-digit', minute: '2-digit' });
};

const aggregateMessagesByPhone = (messagesData: any[], userId: string | undefined): WhatsAppContactType[] => {
	const contactsMap = new Map<string, WhatsAppContactType>();

	messagesData.forEach((msgDoc) => {
		msgDoc.messages.forEach((receiver: any) => {
			const phone = receiver.receiverMobile;
			const messages = receiver.content.map((msg: any) => {
				let isMine = true;

				if (msg.status === 'received' || msg.status === 'unread') isMine = false;
				if (msg.senderId && msg.senderId !== userId) isMine = false;
				if (msgDoc.senderId && msgDoc.senderId !== userId) isMine = false;

				return {
					id: msg.messageId,
					content: msg.messageContent,
					time: formatTime(msg.timestamp),
					isMine: isMine,
					status: msg.status,
					timestamp: msg.timestamp,
					campaignId: msgDoc.campaignId,
				};
			});

			if (!contactsMap.has(phone)) {
				contactsMap.set(phone, {
					id: phone,
					name: phone,
					phone,
					lastSeen: messages.length ? formatTime(messages[messages.length - 1].timestamp) : 'N/A',
					lastMessage: messages.length ? messages[messages.length - 1].content : undefined,
					lastMessageTime: messages.length ? formatTime(messages[messages.length - 1].timestamp) : 'N/A',
					unreadCount: 0,
					messages,
					campaignId: msgDoc.campaignId,
					workflowId: msgDoc.workflowId,
					nodeId: msgDoc.nodeId,
				});
			} else {
				const contact = contactsMap.get(phone)!;
				contact.messages.push(...messages);
				contact.messages.sort((a, b) => a.timestamp - b.timestamp);
				contact.lastMessage = messages[messages.length - 1]?.content || contact.lastMessage;
				contact.lastMessageTime = messages[messages.length - 1]
					? formatTime(messages[messages.length - 1].timestamp)
					: contact.lastMessageTime;
				contact.lastSeen = messages[messages.length - 1]
					? new Date(messages[messages.length - 1].timestamp).toLocaleString()
					: contact.lastSeen;
				contact.campaignId = msgDoc.campaignId;
				contact.workflowId = msgDoc.workflowId;
				contact.nodeId = msgDoc.nodeId;
			}
		});
	});

	return Array.from(contactsMap.values()).sort((a, b) => {
		const aLatest = a.messages[a.messages.length - 1]?.timestamp || 0;
		const bLatest = b.messages[b.messages.length - 1]?.timestamp || 0;
		return bLatest - aLatest;
	});
};

export const useWhatsAppCampaignActions = () => {
	const [contacts, setContacts] = useState<WhatsAppContactType[]>([]);
	const [selectedContact, setSelectedContact] = useState<WhatsAppContactType | undefined>(undefined);
	const [isSidebarOpen, setIsSidebarOpen] = useState(true);
	const [searchTerm, setSearchTerm] = useState('');
	const [currentMessage, setCurrentMessage] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const [isRefreshing, setIsRefreshing] = useState(false);
	const [userId, setUserId] = useState<string | undefined>(undefined);

	const user = useAppSelector((state) => state.userState.user);
	const email = user?.email;

	const messagesEndRef = useRef<HTMLDivElement>(null);
	const autoScrollRef = useRef<any>(null);
	const { socket } = useWebSocket();

	const fetchUserId = async () => {
		if (!email) return;
		try {
			const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/user/id?email=${email}`, {
				withCredentials: true,
			});
			setUserId(response.data);
		} catch {
			//
		}
	};

	const fetchCampaignMessages = async (isRefresh = false) => {
		if (!isLoading || isRefresh) {
			setIsLoading(true);

			if (isRefresh) setIsRefreshing(true);

			try {
				const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/campaign/messages/user`, {
					method: 'GET',
					headers: { 'Content-Type': 'application/json' },
					credentials: 'include',
					cache: 'no-store',
				});

				if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

				const data = await response.json();
				const updatedContacts = aggregateMessagesByPhone(data, userId);

				setContacts((prevContacts) => {
					const mergedContacts = prevContacts
						.map((prev) => {
							const updated = updatedContacts.find((c) => c.id === prev.id);
							return updated
								? {
										...updated,
										messages: [
											...prev.messages,
											...updated.messages.filter(
												(um) => !prev.messages.some((pm) => pm.id === um.id),
											),
										].sort((a, b) => a.timestamp - b.timestamp),
										workflowId: updated.workflowId,
										nodeId: updated.nodeId,
									}
								: prev;
						})
						.concat(updatedContacts.filter((c) => !prevContacts.some((pc) => pc.id === c.id)));
					return mergedContacts;
				});

				if (selectedContact) {
					const updatedSelectedContact = updatedContacts.find((c) => c.id === selectedContact.id);
					if (updatedSelectedContact) {
						setSelectedContact((prev) =>
							prev
								? {
										...prev,
										messages: [
											...prev.messages,
											...updatedSelectedContact.messages.filter(
												(um) => !prev.messages.some((pm) => pm.id === um.id),
											),
										].sort((a, b) => a.timestamp - b.timestamp),
										workflowId: updatedSelectedContact.workflowId,
										nodeId: updatedSelectedContact.nodeId,
									}
								: undefined,
						);
					}
				} else if (updatedContacts.length > 0) {
					setSelectedContact(updatedContacts[0]);
				}
			} catch {
				setContacts([]);
			} finally {
				setIsLoading(false);
				if (isRefresh) setTimeout(() => setIsRefreshing(false), 500);
			}
		}
	};

	useEffect(() => {
		fetchUserId();
	}, [email]);

	useEffect(() => {
		if (userId) fetchCampaignMessages();
	}, [userId]);

	const handleSendMessage = useCallback(async () => {
		if (!selectedContact || !currentMessage.trim()) return;
		if (!selectedContact.workflowId || !selectedContact.nodeId) return;

		const workflowId = selectedContact.workflowId;
		const nodeId = selectedContact.nodeId;

		try {
			await axios.post(
				`${process.env.NEXT_PUBLIC_API_URL}/webhook/whatsapp-tool/${workflowId}/${nodeId}/send-message`,
				{
					receiverMobile: selectedContact.phone,
					messageContent: currentMessage,
					userId,
				},
				{ withCredentials: true },
			);

			setCurrentMessage('');
		} catch {
			//
		}
	}, [selectedContact, currentMessage, userId]);

	const handleUpdateCampaignChat = useCallback(
		(response: {
			status: string;
			content: {
				messageId: string;
				status: string;
				timestamp: number;
				messageContent: string;
				campaignId?: string;
				receiverMobile?: string;
			};
		}) => {
			if (response.status === 'success' && userId && response.content.receiverMobile) {
				const { messageId, status, timestamp, messageContent, campaignId, receiverMobile } = response.content;

				const newMessage: WhatsAppMessageType = {
					id: messageId,
					content: messageContent,
					time: formatTime(timestamp),
					isMine: ['sent', 'delivered', 'read'].includes(status),
					status: status as 'sent' | 'delivered' | 'read' | 'unread' | undefined,
					timestamp,
					campaignId: campaignId || 'dynamic-campaign-' + Date.now(),
				};

				setContacts((prevContacts) => {
					const contactExists = prevContacts.some((c) => c.phone === receiverMobile);
					let updatedContacts = prevContacts;

					if (!contactExists) {
						const newContact: WhatsAppContactType = {
							id: receiverMobile,
							name: receiverMobile,
							phone: receiverMobile,
							lastSeen: formatTime(timestamp),
							lastMessage: messageContent || 'No content',
							lastMessageTime: formatTime(timestamp),
							unreadCount: 0,
							messages: [newMessage],
							campaignId: campaignId || 'dynamic-campaign-' + Date.now(),
							workflowId: selectedContact?.workflowId || '',
							nodeId: selectedContact?.nodeId || '',
						};
						updatedContacts = [...prevContacts, newContact];
					} else {
						updatedContacts = prevContacts.map((contact) =>
							contact.phone === receiverMobile
								? {
										...contact,
										messages: [
											...contact.messages.filter((m) => m.id !== newMessage.id),
											newMessage,
										].sort((a, b) => a.timestamp - b.timestamp),
										lastMessage: newMessage.content,
										lastMessageTime: newMessage.time,
										lastSeen: new Date(newMessage.timestamp).toLocaleString(),
										workflowId: contact.workflowId,
										nodeId: contact.nodeId,
									}
								: contact,
						);
					}

					return updatedContacts.sort((a, b) => {
						const aLatest = a.messages[a.messages.length - 1]?.timestamp || 0;
						const bLatest = b.messages[b.messages.length - 1]?.timestamp || 0;
						return bLatest - aLatest;
					});
				});

				setSelectedContact((prev) =>
					prev && prev.phone === receiverMobile
						? {
								...prev,
								messages: [...prev.messages.filter((m) => m.id !== newMessage.id), newMessage].sort(
									(a, b) => a.timestamp - b.timestamp,
								),
								lastMessage: newMessage.content,
								lastMessageTime: newMessage.time,
								lastSeen: new Date(newMessage.timestamp).toLocaleString(),
								workflowId: prev.workflowId,
								nodeId: prev.nodeId,
							}
						: prev,
				);
			}
		},
		[userId, selectedContact?.phone, selectedContact?.workflowId, selectedContact?.nodeId],
	);

	const handleUpdateCampaignStatus = useCallback(
		(response: {
			status: string;
			content: {
				messageId: string;
				status: string;
				timestamp: number;
				messageContent: string;
				campaignId: string;
				receiverMobile: string;
			};
		}) => {
			if (response.status === 'success' && userId) {
				const { messageId, status, timestamp, messageContent, campaignId, receiverMobile } = response.content;

				setContacts((prevContacts) => {
					const contactExists = prevContacts.some((c) => c.phone === receiverMobile);
					let updatedContacts = prevContacts;

					if (!contactExists) {
						const newContact: WhatsAppContactType = {
							id: receiverMobile,
							name: receiverMobile,
							phone: receiverMobile,
							lastSeen: formatTime(timestamp),
							lastMessage: messageContent || 'No content',
							lastMessageTime: formatTime(timestamp),
							unreadCount: 0,
							messages: [],
							campaignId,
							workflowId: selectedContact?.workflowId || '',
							nodeId: selectedContact?.nodeId || '',
						};

						const newMessage: WhatsAppMessageType = {
							id: messageId,
							content: messageContent || 'No content',
							time: formatTime(timestamp),
							isMine: status !== 'received',
							status: status as 'sent' | 'delivered' | 'read' | 'unread',
							timestamp,
							campaignId,
						};

						newContact.messages.push(newMessage);
						updatedContacts = [...prevContacts, newContact];
					} else {
						updatedContacts = prevContacts.map((contact) => {
							if (contact.phone === receiverMobile) {
								const existingMessageIndex = contact.messages.findIndex((m) => m.id === messageId);

								if (existingMessageIndex !== -1) {
									const updatedMessages = contact.messages.map((m, index) =>
										index === existingMessageIndex
											? {
													...m,
													status: status as 'sent' | 'delivered' | 'read' | 'unread',
													timestamp,
													time: formatTime(timestamp),
												}
											: m,
									);

									return {
										...contact,
										messages: updatedMessages.sort((a, b) => a.timestamp - b.timestamp),
										lastMessage: messageContent || contact.lastMessage || 'No content',
										lastMessageTime: formatTime(timestamp),
										lastSeen: new Date(timestamp).toLocaleString(),
										workflowId: contact.workflowId,
										nodeId: contact.nodeId,
									};
								} else {
									const newMessage: WhatsAppMessageType = {
										id: messageId,
										content: messageContent || 'No content',
										time: formatTime(timestamp),
										isMine: status !== 'received',
										status: status as 'sent' | 'delivered' | 'read' | 'unread',
										timestamp,
										campaignId,
									};

									return {
										...contact,
										messages: [...contact.messages, newMessage].sort(
											(a, b) => a.timestamp - b.timestamp,
										),
										lastMessage: messageContent || 'No content',
										lastMessageTime: formatTime(timestamp),
										lastSeen: new Date(timestamp).toLocaleString(),
										workflowId: contact.workflowId,
										nodeId: contact.nodeId,
									};
								}
							}
							return contact;
						});
					}

					return updatedContacts.sort((a, b) => {
						const aLatest = a.messages[a.messages.length - 1]?.timestamp || 0;
						const bLatest = b.messages[b.messages.length - 1]?.timestamp || 0;
						return bLatest - aLatest;
					});
				});

				setSelectedContact((prev) => {
					if (!prev || prev.phone !== receiverMobile) return prev;
					const existingMessageIndex = prev.messages.findIndex((m) => m.id === messageId);

					if (existingMessageIndex !== -1) {
						const updatedMessages = prev.messages.map((m, index) =>
							index === existingMessageIndex
								? {
										...m,
										status: status as 'sent' | 'delivered' | 'read' | 'unread',
										timestamp,
										time: formatTime(timestamp),
									}
								: m,
						);

						return {
							...prev,
							messages: updatedMessages.sort((a, b) => a.timestamp - b.timestamp),
							lastMessage: messageContent || prev.lastMessage || 'No content',
							lastMessageTime: formatTime(timestamp),
							lastSeen: new Date(timestamp).toLocaleString(),
							workflowId: prev.workflowId,
							nodeId: prev.nodeId,
						};
					} else {
						const newMessage: WhatsAppMessageType = {
							id: messageId,
							content: messageContent || 'No content',
							time: formatTime(timestamp),
							isMine: status !== 'received',
							status: status as 'sent' | 'delivered' | 'read' | 'unread',
							timestamp,
							campaignId,
						};

						return {
							...prev,
							messages: [...prev.messages, newMessage].sort((a, b) => a.timestamp - b.timestamp),
							lastMessage: messageContent || 'No content',
							lastMessageTime: formatTime(timestamp),
							lastSeen: new Date(timestamp).toLocaleString(),
							workflowId: prev.workflowId,
							nodeId: prev.nodeId,
						};
					}
				});
			}
		},
		[userId, selectedContact?.phone],
	);

	useEffect(() => {
		if (!socket || !userId) return;

		socket.on('update-campaign-chat', handleUpdateCampaignChat);
		socket.on('update-campaign-status', handleUpdateCampaignStatus);

		return () => {
			socket.off('update-campaign-chat', handleUpdateCampaignChat);
			socket.off('update-campaign-status', handleUpdateCampaignStatus);
		};
	}, [socket, userId, handleUpdateCampaignChat, handleUpdateCampaignStatus]);

	const filteredContacts = contacts.filter(
		(contact) =>
			contact.name.toLowerCase().includes(searchTerm.toLowerCase()) || contact.phone.includes(searchTerm),
	);

	const onSelectContact = (contactId: string) => {
		const contact = contacts.find((c) => c.id === contactId);
		if (contact) {
			setSelectedContact(contact);
			setCurrentMessage('');
		}
	};

	const handleRefresh = () => fetchCampaignMessages(true);

	return {
		isSidebarOpen,
		setIsSidebarOpen,
		searchTerm,
		setSearchTerm,
		filteredContacts,
		selectedContact,
		currentMessage,
		setCurrentMessage,
		messagesEndRef,
		autoScrollRef,
		onSelectContact,
		handleRefresh,
		isLoading,
		isRefreshing,
		handleSendMessage,
	};
};
