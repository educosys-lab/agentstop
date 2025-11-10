import { FormEvent, useState } from 'react';
import { motion } from 'framer-motion';
import { FiX } from 'react-icons/fi';
import { MessageCircleQuestionIcon, SendIcon } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { usePathname } from 'next/navigation';

import { cn } from '@/utils/theme.util';
import { MODAL_IDS } from '@/constants/modal.constant';
import { URLS } from '@/constants/url.constant';

import { useAppSelector } from '@/store/hook/redux.hook';
import { useModal } from '@/providers/Modal.provider';

import { ButtonElement } from '../../../components/elements/ButtonElement';
import { TextAreaElement } from '../../../components/elements/TextAreaElement';

export default function Chatbot() {
	const location = usePathname();
	const user = useAppSelector((state) => state.userState.user);
	const { activeModals, openModal, closeModal } = useModal();

	const [isLoading, setIsLoading] = useState(false);
	const [chat, setChat] = useState<{ content: string; isMe?: boolean }[]>([]);
	const [currentMessage, setCurrentMessage] = useState('');

	const isChatbotOpen = activeModals.includes(MODAL_IDS.CHATBOT);
	const isHidden = location === '/chat' || location === '/whatsapp-campaign';

	const onFormSubmit = async (event: FormEvent) => {
		event.preventDefault();
		if (!currentMessage.trim()) return;

		setIsLoading(true);
		setChat((prevChat) => [...prevChat, { content: currentMessage, isMe: true }]);
		setCurrentMessage('');

		try {
			const response = await axios.post<any>(`${URLS.PYTHON}/respond_to_query`, {
				user_id: user?.username,
				question: currentMessage,
			});

			const botResponse = response.data.output.messages?.slice(-1)[0]?.content;
			if (botResponse) {
				setChat((prevChat) => [...prevChat, { content: botResponse, isMe: false }]);
			} else {
				toast.error('No valid response from the chatbot.');
			}
		} catch (error) {
			const message = (error as any).response?.data?.message || 'Error occurred!';
			toast.error(message);
			console.error('error', error);
		}

		setIsLoading(false);
	};

	const onCloseChatbot = () => {
		closeModal(MODAL_IDS.CHATBOT);
		setIsLoading(false);
		setCurrentMessage('');
	};

	return (
		<>
			<ButtonElement
				onClick={() => openModal(MODAL_IDS.CHATBOT)}
				size={'icon'}
				title="Open Chatbot"
				className={cn('fixed inset-[auto_50px_35px_auto] z-50 size-12 rounded-full', isHidden && 'hidden')}
			>
				<MessageCircleQuestionIcon className="size-6" />
			</ButtonElement>

			<div
				className={cn(
					'fixed inset-[auto_25px_35px_auto] z-[100] max-w-[500px]',
					isChatbotOpen ? 'block' : 'hidden',
				)}
			>
				<motion.div
					initial={{ scale: 0.9, opacity: 0 }}
					animate={{ scale: 1, opacity: 1 }}
					exit={{ scale: 0.9, opacity: 0 }}
					transition={{ duration: 0.3, ease: 'easeInOut' }}
					className="relative w-72 max-w-md rounded-2xl border border-border bg-gradient-to-br from-gray-900 to-gray-800 p-5 shadow-xl sm:w-72 md:w-96"
				>
					<ButtonElement
						onClick={onCloseChatbot}
						variant="wrapper"
						title="Close"
						className="absolute right-4 top-4 text-muted transition-colors hover:text-foreground"
					>
						<FiX size={24} />
					</ButtonElement>

					<div className="mt-5 text-center">
						<h3 className="gradient-primary-light bg-clip-text text-2xl font-bold text-transparent sm:text-3xl">
							Agentstop Help
						</h3>
						{/* <p className="mt-1 text-muted">How can I help you!</p> */}
					</div>

					<div className="mt-5 flex max-h-[40dvh] flex-col gap-3 overflow-auto pr-2">
						{chat.map((item, index) => (
							<p
								key={index}
								className={cn(
									'w-max max-w-full rounded-2xl p-3',
									item.isMe
										? 'ml-auto bg-gradient-to-r from-blue-600 to-purple-600'
										: 'border-[2px] border-gray-700 bg-gray-800',
								)}
							>
								{item.content}
							</p>
						))}
					</div>

					<form onSubmit={onFormSubmit} className="pt-3">
						<div className="relative">
							<TextAreaElement
								value={currentMessage}
								onChange={(event) => setCurrentMessage(event.target.value)}
								autoFocus
								onKeyDown={(event) => {
									if (event.key === 'Enter' && !event.shiftKey) {
										event.preventDefault();
										onFormSubmit(event);
									}
								}}
								autoAdjustHeight={true}
								placeholder={`Ask me anything about Agentstop!`}
								disabled={isLoading}
								inputClassName="w-full max-h-[150px] !resize-none rounded-2xl border pr-16 no-scrollbar"
							/>

							<ButtonElement
								type="submit"
								disabled={isLoading}
								title="Ask Agentstop"
								variant={'wrapper'}
								className="absolute inset-[10px_10px_auto_auto] flex items-center rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 p-2 transition-all duration-300 hover:opacity-90"
							>
								<SendIcon className="size-5" />
							</ButtonElement>
						</div>
					</form>
				</motion.div>
			</div>
		</>
	);
}
