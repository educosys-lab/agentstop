import { ReactNode, useState } from 'react';

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

type TooltipElementPropsType = {
	trigger: ReactNode;
	content: ReactNode;
	position?: 'top' | 'bottom' | 'left' | 'right';
};

export function TooltipElement({ trigger, content, position = 'top' }: TooltipElementPropsType) {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<TooltipProvider>
			<Tooltip open={isOpen} onOpenChange={setIsOpen}>
				<TooltipTrigger
					onClick={(event) => {
						event.stopPropagation();
						setIsOpen((prev) => !prev);
					}}
					asChild
				>
					{trigger}
				</TooltipTrigger>
				<TooltipContent side={position}>{content}</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
}
