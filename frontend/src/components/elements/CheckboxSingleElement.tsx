import { ReactNode } from 'react';

import { cn } from '@/utils/theme.util';

import { InputLabelElement } from '@/components/elements/InputLabelElement';
import { Checkbox } from '../ui/checkbox';

type CheckboxSingleElementPropsType = {
	value: boolean;
	onChange: (value: any) => void;
	disabled?: boolean;
	content: ReactNode;
	label?: ReactNode;
	message?: string;
	isError?: boolean;
	labelClassName?: string;
	errorClassName?: string;
};

export const CheckboxSingleElement = ({
	value,
	onChange,
	disabled,
	content,
	label,
	message,
	isError,
	labelClassName,
	errorClassName,
}: CheckboxSingleElementPropsType) => {
	return (
		<div className="flex flex-col gap-1">
			{label && <InputLabelElement label={label} labelClassName={labelClassName} />}

			<div className="flex items-center gap-2">
				<Checkbox disabled={disabled} checked={value} onCheckedChange={onChange} />
				{content && <InputLabelElement label={content} />}
			</div>

			{message && (
				<p
					className={cn(
						'input-message',
						`${isError ? 'input-error-message' : 'input-success-message'}`,
						errorClassName,
					)}
				>
					{message}
				</p>
			)}
		</div>
	);
};
