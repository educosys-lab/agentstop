import { ReactNode, useEffect } from 'react';
import { XIcon } from 'lucide-react';

import { useModal } from '@/providers/Modal.provider';
import { cn } from '@/utils/theme.util';

import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { HiddenElement } from '@/components/elements/HiddenElement';
import { ButtonElement } from './ButtonElement';

export type ModalWidthType = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | 'auto';

type ModalElementProps = {
	modalId: string;
	modalWidth: ModalWidthType;
	onOpenModal?: () => void;
	onCloseModal?: () => void;
	trigger?: ReactNode;
	modalTitle: string;
	modalDescription: string;
	children: ReactNode;
	className?: string;
};

export const ModalElement = ({
	modalId,
	modalWidth,
	onOpenModal,
	onCloseModal,
	trigger,
	modalTitle,
	modalDescription,
	children,
	className,
}: ModalElementProps) => {
	const { activeModals, openModal, closeModal } = useModal();

	const modalWidthObject = {
		sm: 'sm:max-w-sm',
		md: 'sm:max-w-md',
		lg: 'sm:max-w-lg',
		xl: 'sm:max-w-xl',
		'2xl': 'sm:max-w-2xl',
		'3xl': 'sm:max-w-3xl',
		'4xl': 'sm:max-w-4xl',
		'5xl': 'sm:max-w-5xl',
		auto: 'sm:max-w-max',
	};

	useEffect(() => {
		if (!activeModals.includes(modalId) || !onOpenModal) return;
		onOpenModal();
	}, [activeModals]);

	return (
		<Dialog
			open={activeModals.includes(modalId)}
			onOpenChange={() => {
				if (activeModals.length === 0) return;
				closeModal(modalId, onCloseModal);
			}}
		>
			{trigger && <DialogTrigger onClick={() => openModal(modalId)}>{trigger}</DialogTrigger>}

			<DialogContent
				no-close-button="true"
				className={cn('flex max-h-[95%] max-w-[95%]', modalWidthObject[modalWidth], className)}
			>
				<HiddenElement>
					<DialogTitle>{modalTitle}</DialogTitle>
					<DialogDescription>{modalDescription}</DialogDescription>
				</HiddenElement>

				<div className="w-full overflow-y-auto overflow-x-hidden p-2 md:p-3 lg:p-4">{children}</div>

				<ButtonElement
					onClick={() => closeModal(modalId, onCloseModal)}
					title="Close"
					variant={'destructive'}
					size={'icon'}
					className="absolute inset-[-8px_-8px_auto_auto] size-max shrink-0 rounded-full p-0.5"
				>
					<XIcon className="size-4" />
				</ButtonElement>
			</DialogContent>
		</Dialog>
	);
};
