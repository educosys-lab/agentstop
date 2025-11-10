import { FiX } from 'react-icons/fi';

import { cn } from '@/utils/theme.util';
import { MODAL_IDS } from '@/constants/modal.constant';

import { useModal } from '@/providers/Modal.provider';

import { ButtonElement } from '@/components/elements/ButtonElement';

export default function AdvancedSettings() {
	const { activeModals, closeModal } = useModal();

	return (
		<div
			className={cn(
				'fixed inset-0 z-10 flex items-center justify-center bg-black/60 p-3 backdrop-blur-md',
				!activeModals.includes(MODAL_IDS.ADVANCED_SETTINGS) && 'hidden',
			)}
		>
			<div className="relative size-full max-h-[500px] max-w-3xl rounded-xl bg-light/10 p-10">
				<ButtonElement
					onClick={() => closeModal(MODAL_IDS.ADVANCED_SETTINGS)}
					variant="wrapper"
					title="Close"
					className="absolute right-4 top-4 text-muted transition-colors hover:text-foreground"
				>
					<FiX size={24} />
				</ButtonElement>
			</div>
		</div>
	);
}
