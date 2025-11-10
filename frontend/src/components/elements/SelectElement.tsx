import { ReactNode } from 'react';

import { cn, getTextVariantColor } from '@/utils/theme.util';
import { TextType } from '@/types/text.type';

import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { InputLabelElement } from '@/components/elements/InputLabelElement';

export type SelectContentType = {
	value: string;
	label?: ReactNode;
	icon?: ReactNode;
	variant?: TextType;
};

export type SelectContentGroupType = {
	category?: string;
	options: SelectContentType[];
};

type SelectElementProps = {
	value: any;
	onChange: (value: any) => void;
	disabled?: boolean;
	triggerText: string;
	content: SelectContentType[] | SelectContentGroupType[];
	disabledValues?: {
		type: 'time';
		value: { value: number; type: 'hour' | 'min'; state: 'before' | 'after' } | undefined;
	};
	label?: ReactNode;
	message?: string;
	isError?: boolean;
	labelClassName?: string;
	triggerClassName?: string;
	itemClassName?: string;
	errorClassName?: string;
	viewportClassName?: string;
	containerClassName?: string;
};

export const SelectElement = ({
	value,
	onChange,
	disabled,
	triggerText,
	content,
	disabledValues,
	label,
	message,
	isError,
	labelClassName,
	triggerClassName,
	itemClassName,
	errorClassName,
	viewportClassName,
	containerClassName,
}: SelectElementProps) => {
	let allValues: string[];
	if ('group' in content) {
		const contentWithType = content as SelectContentGroupType[];
		allValues = contentWithType.flatMap((item) => item.options.map((value) => value.value));
	} else {
		const contentWithType = content as SelectContentType[];
		allValues = contentWithType.map((value) => value.value);
	}

	const isValueInContent = allValues.includes(value);

	const getIsDisabled = (selectedValue: any) => {
		if (!disabledValues) return false;

		if (disabledValues.type === 'time' && disabledValues.value) {
			const { value, state } = disabledValues.value;
			if (state === 'before') return Number(selectedValue) < value;
			else if (state === 'after') return Number(selectedValue) > value;
		}

		return false;
	};

	return (
		<div className={cn('flex flex-col gap-1', containerClassName)}>
			{label && <InputLabelElement label={label} labelClassName={labelClassName} />}

			<Select value={value} onValueChange={(value) => onChange(value)}>
				<SelectTrigger
					disabled={disabled}
					className={cn('border-2', !isValueInContent && 'text-muted-foreground-light', triggerClassName)}
				>
					<SelectValue placeholder={triggerText} />
				</SelectTrigger>

				<SelectContent sideOffset={2} viewportClassName={viewportClassName}>
					{content.map((item, index) => {
						if ('options' in item) {
							const itemWithType = item as SelectContentGroupType;

							return (
								<SelectGroup key={itemWithType.category} className={index > 0 ? 'mt-5' : ''}>
									{itemWithType.category && (
										<SelectLabel className="text-base">{itemWithType.category}</SelectLabel>
									)}

									{itemWithType.options.map((groupValue) => {
										const currentButtonType = getTextVariantColor(groupValue.variant);

										return (
											<SelectItem
												key={groupValue.value}
												value={groupValue.value}
												disabled={getIsDisabled(groupValue.value)}
												className={cn(currentButtonType, itemClassName)}
											>
												{groupValue.label || groupValue.value}
											</SelectItem>
										);
									})}
								</SelectGroup>
							);
						} else {
							const itemWithType = item as SelectContentType;
							const currentButtonType = getTextVariantColor(itemWithType.variant);

							return (
								<SelectItem
									key={itemWithType.value}
									value={itemWithType.value}
									disabled={getIsDisabled(itemWithType.value)}
									className={cn(currentButtonType, itemClassName)}
								>
									{itemWithType.label || itemWithType.value}
								</SelectItem>
							);
						}
					})}
				</SelectContent>
			</Select>

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

// const demoGroupData = [
// 	{
// 		id: 'audio-input',
// 		group: [
// 			{ value: 'Default Microphone' },
// 			{ value: 'Realtek Microphone' },
// 			{ value: 'Sony WH-1000XM4' },
// 		],
// 	},
// ];

// const demoSingleData = [
// 	{ value: 'Default Microphone' },
// 	{ value: 'Realtek Microphone' },
// 	{ value: 'Sony WH-1000XM4' },
// ];
