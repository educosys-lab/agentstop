import { ReactNode } from 'react';
import { InfoIcon } from 'lucide-react';

import { cn } from '@/utils/theme.util';

import { TooltipElement } from '@/components/elements/TooltipElement';
import { LinkElement } from '@/components/elements/LinkElement';

type NodeConfigLabelPropsType = {
	label: ReactNode;
	isRequired?: boolean;
	helperText: string;
	helperLink?: string;
};

export default function NodeConfigLabel({ label, isRequired, helperText, helperLink }: NodeConfigLabelPropsType) {
	return (
		<div className="flex items-center gap-1 text-sm">
			<span className="truncate">{label}</span>
			<span className={cn('text-destructive', !isRequired && 'hidden')}>*</span>
			<TooltipElement
				trigger={<InfoIcon className="size-[18px] shrink-0 fill-muted-dark stroke-background stroke-[3px]" />}
				content={
					<p className="flex max-w-sm flex-col gap-2">
						{helperLink ? (
							<>
								<span>{helperText}</span>
								<LinkElement
									href={helperLink}
									target="_blank"
									rel="noopener noreferrer"
									title={helperText}
									className="text-primary"
								>
									{helperLink}
								</LinkElement>
							</>
						) : (
							helperText
						)}
					</p>
				}
			/>
		</div>
	);
}
