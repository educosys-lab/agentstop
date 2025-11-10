'use client';

import { ChevronLeftIcon, User } from 'lucide-react';
import { WhatsAppContactType } from '../_types/whatsapp-campaign.type';
import { ButtonElement } from '@/components/elements/ButtonElement';
import { cn } from '@/utils/theme.util';

type WhatsAppCampaignTopbarProps = {
	isSidebarOpen: boolean;
	setIsSidebarOpen: (isOpen: boolean) => void;
	selectedContact: WhatsAppContactType;
};

export default function WhatsAppCampaignTopbar({
	isSidebarOpen,
	setIsSidebarOpen,
	selectedContact,
}: WhatsAppCampaignTopbarProps) {
	return (
		<div className="flex h-16 items-center border-b pt-2 border-[#222e35] bg-[#202c33] px-4">

            <ButtonElement
                onClick={() => (isSidebarOpen ? setIsSidebarOpen(false) : setIsSidebarOpen(true))}
                title="Toggle sidebar"
                variant={'wrapper'}
                className="mr-3 rounded-md p-2 text-gray-400 transition-all hover:bg-gray-600 hover:text-gray-200"
            >
                <ChevronLeftIcon className={cn('size-5 stroke-[3px] transition-all', !isSidebarOpen && 'rotate-180')} />
            </ButtonElement>

			<div className="flex flex-1 items-center gap-3">
				<div className="relative">
					<div className="flex size-10 items-center justify-center rounded-full bg-[#6b7c85]">
						<span className="text-sm font-medium text-white">
							<User />
						</span>
					</div>
				</div>

				<div className="min-w-0 flex-1">
					<h2 className="truncate text-2xl font-light text-white">{selectedContact.name}</h2>
				</div>
			</div>
		</div>
	);
}