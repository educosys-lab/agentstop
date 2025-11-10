import { ReactNode } from 'react';

import { cn } from '@/utils/theme.util';

type InputLabelProps = {
	label: ReactNode;
	name?: string;
	labelClassName?: string;
};

export const InputLabelElement = ({ label, name, labelClassName }: InputLabelProps) => {
	return (
		<label htmlFor={name} className={cn('input-label', labelClassName)}>
			{label}
		</label>
	);
};
