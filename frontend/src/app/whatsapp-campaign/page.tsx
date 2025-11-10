'use client';

import { useRef, useEffect } from 'react';
import { MessageCircle, SendIcon } from 'lucide-react';

import { cn } from '@/utils/theme.util';
import { useWhatsAppCampaignActions } from './_hooks/useWhatsAppCampaignActions.hook';

import WhatsAppCampaignList from './_components/WhatsAppCampaignList';
import WhatsAppCampaignTopbar from './_components/WhatsAppCampaignTopbar';
import { AutoScrollToBottomElement } from '@/components/modules/AutoScrollToBottomElement';
import { ButtonElement } from '@/components/elements/ButtonElement';

export default function WhatsAppCampaignPage() {
	const messageRefs = useRef<Record<string, HTMLDivElement | null>>({});
	const sidebarRef = useRef<HTMLDivElement>(null);

	const {
		isSidebarOpen,
		setIsSidebarOpen,
		searchTerm,
		setSearchTerm,
		filteredContacts,
		selectedContact,
		onSelectContact,
		currentMessage,
		setCurrentMessage,
		messagesEndRef,
		autoScrollRef,
		handleRefresh,
		isLoading,
		isRefreshing,
		handleSendMessage,
	} = useWhatsAppCampaignActions();

	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			const isMobile = window.innerWidth < 768;

			if (isMobile && isSidebarOpen && sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
				setIsSidebarOpen(false);
			}
		}

		document.addEventListener('mousedown', handleClickOutside);

		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [isSidebarOpen, setIsSidebarOpen]);

	useEffect(() => {
		if (autoScrollRef.current && messagesEndRef.current) {
			messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
		}
	}, [selectedContact?.messages, autoScrollRef, messagesEndRef]);

	return (
		<div className="flex h-dvh flex-col bg-[#111b21] sm:flex-row">
			<WhatsAppCampaignList
				ref={sidebarRef}
				isSidebarOpen={isSidebarOpen}
				setIsSidebarOpen={setIsSidebarOpen}
				searchTerm={searchTerm}
				setSearchTerm={setSearchTerm}
				filteredContacts={filteredContacts}
				selectedContact={selectedContact}
				onSelectContact={onSelectContact}
				handleRefresh={handleRefresh}
				isLoading={isLoading}
				isRefreshing={isRefreshing}
			/>

			<div className="relative flex size-full flex-col bg-[#0b141a]">
				{selectedContact && (
					<WhatsAppCampaignTopbar
						isSidebarOpen={isSidebarOpen}
						setIsSidebarOpen={setIsSidebarOpen}
						selectedContact={selectedContact}
					/>
				)}

				{!selectedContact ? (
					<div className="flex h-full flex-col items-center justify-center bg-[#222e35] text-center">
						<div className="mb-8">
							<div className="mx-auto mb-6 flex size-32 items-center justify-center rounded-full bg-[#00a884]/10">
								<MessageCircle className="size-20" />
							</div>
						</div>

						<h1 className="mb-2 text-3xl font-light text-white">WhatsApp Campaign</h1>
						<p className="mb-2 text-[#8696a0]">
							Send and receive messages without keeping your phone online.
						</p>
					</div>
				) : (
					<>
						<div
							ref={messagesEndRef}
							className="flex-1 overflow-y-auto bg-[#0b141a] p-4"
							style={{
								backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23182229' fill-opacity='0.05'%3E%3Cpath d='m36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
							}}
						>
							<div className="space-y-2">
								{selectedContact?.messages?.map((message) => (
									<div
										key={message.id}
										ref={(element) => void (messageRefs.current[message.id] = element)}
										className={`flex ${message.isMine ? 'justify-end' : 'justify-start'}`}
									>
										<div
											className={cn(
												'max-w-[65%] rounded-lg px-3 py-2 shadow-sm',
												message.isMine ? 'bg-[#005c4b] text-white' : 'bg-[#202c33] text-white',
											)}
										>
											<p className="text-sm leading-relaxed">
												{message.content.split(/(\*.*?\*|_.*?_)/g).map((part, i) => {
													if (part.startsWith("*") && part.endsWith("*")) {
													return (
														<strong key={i}>
														{part.slice(1, -1)}
														</strong>
													);
													}
													if (part.startsWith("_") && part.endsWith("_")) {
													return (
														<span key={i} className="underline">
														{part.slice(1, -1)}
														</span>
													);
													}
													return part;
												})}
												</p>
											<div className="mt-1 flex items-center justify-end gap-1">
												<span className="text-xs text-[#8696a0]">{message.time}</span>

												{message.isMine && (
													<div className="flex">
														<svg width="16" height="15" viewBox="0 0 16 15" fill="none">
															<path
																d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.879a.32.32 0 0 1-.484.033l-.358-.325a.319.319 0 0 0-.484.032l-.378.483a.418.418 0 0 0 .036.541l1.32 1.266c.143.14.361.125.484-.033l6.272-8.048a.366.366 0 0 0-.063-.51zm-4.1 0l-.478-.372a.365.365 0 0 0-.51.063L4.566 9.879a.32.32 0 0 1-.484.033L1.891 7.769a.319.319 0 0 0-.484.032l-.378.483a.418.418 0 0 0 .036.541l3.61 3.461c.142.14.361.125.484-.033l6.272-8.048a.365.365 0 0 0-.063-.51z"
																fill={message.status === 'read' ? '#53bdeb' : '#8696a0'}
															/>
														</svg>
													</div>
												)}
											</div>
										</div>
									</div>
								))}

								<AutoScrollToBottomElement
									ref={autoScrollRef}
									containerRef={messagesEndRef}
									paddingBottom="120px"
									trigger={selectedContact?.messages?.length}
								/>
							</div>
						</div>

						<div className="border-t border-[#222e35] bg-[#202c33] p-4">
							<div className="flex items-center gap-3">
								<div className="flex-1">
									<div className="relative">
										<textarea
											value={currentMessage}
											onChange={(e) => setCurrentMessage(e.target.value)}
											onKeyDown={(e) => {
												if (
													e.key === 'Enter' &&
													!e.shiftKey &&
													currentMessage.trim() &&
													selectedContact
												) {
													e.preventDefault();
													handleSendMessage();
												}
											}}
											placeholder="Type a message"
											className="max-h-32 min-h-[40px] w-full resize-none rounded-lg bg-[#2a3942] px-3 py-5 pr-12 text-white placeholder-[#8696a0] outline-none focus:bg-[#2a3942] focus:ring-1 focus:ring-[#00a884]"
											rows={1}
											style={{
												height: 'auto',
												minHeight: '40px',
											}}
											onInput={(e) => {
												const target = e.target as HTMLTextAreaElement;
												target.style.height = 'auto';
												target.style.height = Math.min(target.scrollHeight, 128) + 'px';
											}}
										/>
									</div>
								</div>

								<ButtonElement
									type="submit"
									disabled={!currentMessage.trim() || !selectedContact}
									title="Send message"
									variant="wrapper"
									className={cn(
										'flex size-10 items-center justify-center rounded-full transition-all',
										currentMessage.trim() && selectedContact
											? 'bg-[#00a884] hover:bg-[#00a884]/90'
											: 'cursor-not-allowed bg-[#2a3942]',
									)}
									onClick={() => handleSendMessage()}
								>
									<SendIcon className="size-5 text-white" />
								</ButtonElement>
							</div>
						</div>
					</>
				)}
			</div>
		</div>
	);
}
