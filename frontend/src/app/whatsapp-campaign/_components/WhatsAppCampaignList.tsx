'use client';
import React from 'react';
import { ArrowLeftIcon, SearchIcon, UserIcon, RefreshCcw } from 'lucide-react';
import { cn } from '@/utils/theme.util';
import { WhatsAppContactType } from '../_types/whatsapp-campaign.type';
import { ButtonElement } from '@/components/elements/ButtonElement';
import { LinkElement } from '@/components/elements/LinkElement';
import { URLS } from '@/constants/url.constant';

type WhatsAppCampaignListProps = {
	isSidebarOpen: boolean;
	setIsSidebarOpen: (isOpen: boolean) => void;
	searchTerm: string;
	setSearchTerm: (term: string) => void;
	filteredContacts: WhatsAppContactType[];
	selectedContact: WhatsAppContactType | undefined;
	onSelectContact: (contactId: string) => void;
	handleRefresh: () => void;
	isLoading: boolean;
	isRefreshing?: boolean;
};

const WhatsAppCampaignList = React.forwardRef<HTMLDivElement, WhatsAppCampaignListProps>(
	(
		{
			isSidebarOpen,
			setIsSidebarOpen,
			searchTerm,
			setSearchTerm,
			filteredContacts,
			selectedContact,
			onSelectContact,
			handleRefresh,
			isLoading,
			isRefreshing = false,
		},
		ref,
	) => {
		return (
			<div
				ref={ref}
				className={cn(
					'fixed z-10 flex h-full w-80 shrink-0 flex-col border-r-2 border-white/20 bg-[#111b21] transition-all duration-300 tablet:relative',
					!isSidebarOpen && 'hidden',
				)}
			>
				<div className="flex items-center justify-between bg-[#202c33] p-4 pt-6">
					<h1 className="text-xl font-medium text-white">Chats</h1>
					<div className="flex gap-2">
						<ButtonElement
							onClick={handleRefresh}
							title="Refresh"
							variant="wrapper"
							className="rounded-md p-2 text-white transition-all hover:bg-[#2a3942] disabled:opacity-50"
							disabled={isLoading || isRefreshing}
						>
							<RefreshCcw className={cn('size-4', isRefreshing && 'animate-spin')} />
						</ButtonElement>
						<ButtonElement
							onClick={() => setIsSidebarOpen(false)}
							title="Close sidebar"
							variant="wrapper"
							className="rounded-md p-2 text-[#8696a0] transition-all hover:bg-[#2a3942] tablet:hidden"
						>
							<ArrowLeftIcon className="size-4" />
						</ButtonElement>
						<LinkElement
							href={URLS.DASHBOARD}
							title="Go to Dashboard"
							className="flex items-center gap-1.5 text-sm transition-all hover:text-gray-400"
						>
							<ArrowLeftIcon className="size-4" />
							Dashboard
						</LinkElement>
					</div>
				</div>

				<div className="bg-[#202c33] px-3 pb-3">
					<div className="relative">
						<div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8696a0]">
							<SearchIcon className="size-4" />
						</div>
						<input
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							placeholder="Search Users"
							className="w-full rounded-lg bg-[#2a3942] py-2 pl-10 pr-3 text-sm text-white placeholder-[#8696a0] outline-none focus:bg-[#2a3942] focus:ring-1 focus:ring-[#00a884]"
						/>
					</div>
				</div>

				<div className="flex-1 overflow-y-auto">
					{filteredContacts.map((contact) => (
						<div
							key={contact.id}
							onClick={() => onSelectContact(contact.id)}
							className={cn(
								'flex cursor-pointer items-center gap-3 border-b border-[#222e35] p-3 transition-all hover:bg-[#2a3942]',
								selectedContact?.id === contact.id && 'bg-[#2a3942]',
							)}
						>
							<div className="relative">
								<div className="flex size-12 items-center justify-center rounded-full bg-[#6b7c85]">
									<UserIcon className="size-6 text-white" />
								</div>
							</div>
							<div className="min-w-0 flex-1">
								<div className="flex items-center justify-between">
									<h3 className="truncate text-lg font-light text-white">{contact.name}</h3>
									<span className="text-xs text-[#8696a0]">{contact.lastMessageTime}</span>
								</div>
								<div className="flex items-center justify-between">
									<p className="truncate text-sm text-[#8696a0]">
										{contact.lastMessage || 'No messages yet'}
									</p>
									{contact.unreadCount > 0 && (
										<div className="flex size-5 items-center justify-center rounded-full bg-[#00a884] text-xs text-white">
											{contact.unreadCount > 99 ? '99+' : contact.unreadCount}
										</div>
									)}
								</div>
							</div>
						</div>
					))}
				</div>
			</div>
		);
	},
);

WhatsAppCampaignList.displayName = 'WhatsAppCampaignList';

export default WhatsAppCampaignList;
