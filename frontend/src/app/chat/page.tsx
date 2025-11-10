'use client';

import { useRef, useState } from 'react';
import ReactPlayer from 'react-player';
import { SendIcon, TriangleAlertIcon, XIcon } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

import { Copy, Check } from 'lucide-react';
import { cn } from '@/utils/theme.util';
import { URLS } from '@/constants/url.constant';

import { useAppSelector } from '@/store/hook/redux.hook';
import { useInteractActions } from './_hooks/useInteractActions.hook';

import InteractList from './_components/InteractList';
import InteractTopbar from './_components/InteractTopbar';
import AnalyticsDashboard from '../campaign-analytics/_components/AnalyticsDashboard';
import { AutoScrollToBottomElement } from '@/components/modules/AutoScrollToBottomElement';
import { RenderMessageElement } from '@/components/elements/RenderMessageElement';
import { ButtonElement } from '@/components/elements/ButtonElement';
import { TextAreaElement } from '@/components/elements/TextAreaElement';
import { Loader } from '@/components/elements/LoaderElement';

// import { analyticsDummyData } from '../campaign-analytics/campaign.data';

export default function InteractPage() {
	const messageRefs = useRef<Record<string, HTMLDivElement | null>>({});
	const [copiedMessageId, setCopiedMessageId] = useState<string | number | null>(null);

	const user = useAppSelector((state) => state.userState.user);
	const {
		isSidebarOpen,
		setIsSidebarOpen,
		searchTerm,
		setSearchTerm,
		filteredInteracts,
		selectedInteract,
		onSelectInteract,
		currentMessage,
		setCurrentMessage,
		onSendMessage,
		messagesEndRef,
		autoScrollRef,
		showAnalytics,
		setShowAnalytics,
		analytics,
	} = useInteractActions();

	const isLive = selectedInteract?.status === 'live';

	const selectedAnalytics = analytics.find((data) => data.workflow.id === selectedInteract?.workflowId);

	if (!user) return null;
	return (
		<div className="flex h-dvh flex-col bg-background-dark sm:flex-row">
			<InteractList
				isSidebarOpen={isSidebarOpen}
				setIsSidebarOpen={setIsSidebarOpen}
				searchTerm={searchTerm}
				setSearchTerm={setSearchTerm}
				filteredInteracts={filteredInteracts}
				selectedInteract={selectedInteract}
				onSelectInteract={onSelectInteract}
			/>

			<div className={cn('relative flex size-full flex-col', showAnalytics && 'flex-row')}>
				<div className="relative flex size-full flex-col">
					<InteractTopbar
						isSidebarOpen={isSidebarOpen}
						setIsSidebarOpen={setIsSidebarOpen}
						selectedInteract={selectedInteract}
						isAnalyticsPresent={!!selectedAnalytics}
						showAnalytics={showAnalytics}
						onToggleAnalytics={() => setShowAnalytics(!showAnalytics)}
					/>

					<div
						className={cn(
							'absolute inset-[80px_0px_auto_0px] mx-auto flex w-max items-center gap-1.5 rounded-lg bg-warn-dark px-4 py-3',
							isLive && 'hidden',
						)}
					>
						<TriangleAlertIcon className="size-6 text-warn" />
						<p>You can not chat if the linked mission is not live!</p>
					</div>

					{!selectedInteract && (
						<div className="mt-5 flex flex-col items-center justify-center">
							<ReactPlayer
								url={`${URLS.VIDEOS}/logoHappyAnimation.webm`}
								playing
								loop
								muted
								className="h-20"
							/>
							<p className="text-xl text-muted">Select a live mission chat to continue...</p>
						</div>
					)}

					<div ref={messagesEndRef} className="flex grow flex-col overflow-y-auto p-4">
						{selectedInteract?.messages.length === 0 && (
							<div className="mt-5 flex h-full flex-col items-center justify-center text-center">
								<ReactPlayer
									url={`${URLS.VIDEOS}/logoHappyAnimation.webm`}
									playing
									loop
									muted
									className="h-20"
								/>
								<h5 className="mb-2 text-blue-400">
									Start interacting with {selectedInteract.workflowTitle}
								</h5>
								<p className="text-gray-400">Type your message below to begin</p>
							</div>
						)}

						<div className="space-y-2">
							{selectedInteract?.messages.map((message) => {
								const isMine = message.username === user.username;

								const handleCopy = async (id: string, fallback: string) => {
									try {
										const textToCopy = messageRefs.current[id]?.innerText || fallback;
										await navigator.clipboard.writeText(textToCopy);

										setCopiedMessageId(id);
										setTimeout(() => {
											setCopiedMessageId(null);
										}, 1500);
									} catch (error) {
										console.error('Failed to copy text:', error);
									}
								};

								return (
									<div
										key={message.id}
										className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
									>
										<div className="flex max-w-[90%] flex-col sm:max-w-3xl">
											<div
												ref={(element) => void (messageRefs.current[message.id] = element)}
												className={cn(
													'w-full min-w-20 rounded-2xl p-3',
													isMine
														? 'bg-gradient-to-r from-blue-600 to-purple-600'
														: 'border-[2px] border-gray-700 bg-gray-800',
												)}
											>
												<RenderMessageElement content={message.content.replace(/^"|"$/g, '')} />
											</div>

											<div
												className={`mt-1 flex w-full px-1 ${isMine ? 'justify-end gap-2' : 'justify-start gap-2'}`}
											>
												<ButtonElement
													onClick={() => handleCopy(message.id, message.content)}
													title="Copy"
													variant={'wrapper'}
													className="mx-0.5 text-blue-300 hover:text-blue-500"
												>
													{copiedMessageId === message.id ? (
														<Check size={16} />
													) : (
														<Copy size={16} />
													)}
												</ButtonElement>
											</div>
										</div>
									</div>
								);
							})}

							<AutoScrollToBottomElement
								ref={autoScrollRef}
								containerRef={messagesEndRef}
								paddingBottom="500px"
								trigger={selectedInteract?.messages.length}
							/>
						</div>
					</div>

					{selectedInteract && (
						<div className="w-full bg-background-dark p-4">
							<form onSubmit={onSendMessage} className="flex items-center space-x-2">
								<div className="relative flex-1">
									<TextAreaElement
										value={currentMessage}
										onChange={(event) => setCurrentMessage(event.target.value)}
										autoFocus
										onKeyDown={(event) => {
											if (event.key === 'Enter' && !event.shiftKey) {
												event.preventDefault();
												onSendMessage(event);
											}
										}}
										autoAdjustHeight={true}
										placeholder={`Message ${selectedInteract.workflowTitle}...`}
										disabled={selectedInteract.status !== 'live'}
										inputClassName="w-full max-h-[400px] !resize-none rounded-2xl border pr-16 no-scrollbar"
									/>

									<ButtonElement
										type="submit"
										disabled={!currentMessage.trim() || !isLive}
										title="Send message"
										variant={'wrapper'}
										className={`absolute inset-[auto_10px_10px_auto] flex items-center rounded-xl px-3 py-3 transition-all duration-300 ${
											currentMessage.trim()
												? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:opacity-90'
												: 'bg-gray-700'
										} `}
									>
										<SendIcon className="size-5" />
									</ButtonElement>
								</div>
							</form>
						</div>
					)}
				</div>

				{/* Analytics Dashboard */}
				<AnimatePresence>
					{showAnalytics && (
						<motion.div
							initial={{ x: '100%' }}
							animate={{ x: 0 }}
							exit={{ x: '100%' }}
							transition={{ duration: 0.25, ease: 'easeInOut' }}
							className="absolute right-0 top-0 z-50 h-full w-full max-w-[800px] overflow-y-auto border-l border-gray-800 bg-gray-900"
						>
							{selectedAnalytics ? (
								<AnalyticsDashboard
									selectedAnalytics={selectedAnalytics}
									refreshCampaignAnalytics={() => Promise.resolve()}
									onClose={() => setShowAnalytics(false)}
								/>
							) : (
								<div className="relative flex size-full flex-col items-center justify-center gap-2">
									<ButtonElement
										onClick={() => setShowAnalytics(false)}
										title="Close Analytics"
										variant={'wrapper'}
										className="absolute inset-[15px_15px_auto_auto] flex-shrink-0 rounded-md p-2 text-gray-400 transition-all hover:bg-gray-700 hover:text-gray-200"
									>
										<XIcon className="size-4 md:size-5" />
									</ButtonElement>

									<Loader loaderClassName="size-8" />
									<h5 className="text-gray-400">Loading analytics...</h5>
								</div>
							)}
						</motion.div>
					)}
				</AnimatePresence>
			</div>
		</div>
	);
}
