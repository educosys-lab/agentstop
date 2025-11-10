'use client';

import { Control, Controller } from 'react-hook-form';
import { FormEvent, InputHTMLAttributes, ReactNode, RefObject, useEffect, useRef } from 'react';

import { cn } from '@/utils/theme.util';

import { InputLabelElement } from '@/components/elements/InputLabelElement';
import { Textarea } from '@/components/ui/textarea';

type TextAreaWithControl = { control: Control<any>; name: string };
type TextAreaWithoutControl = { control?: never; name?: never };

type TextAreaProps = InputHTMLAttributes<HTMLTextAreaElement> &
	(TextAreaWithControl | TextAreaWithoutControl) & {
		ref?: RefObject<HTMLTextAreaElement>;
		label?: ReactNode;
		message?: string;
		isError?: boolean;
		autoAdjustHeight?: boolean;
		autoAdjustHeightTrigger?: any[];
		inputClassName?: string;
		labelClassName?: string;
		errorClassName?: string;
		containerClassName?: string;
	};

export const TextAreaElement = ({
	control,
	name,
	ref,
	label,
	message,
	isError,
	autoAdjustHeight,
	autoAdjustHeightTrigger = [],
	inputClassName,
	labelClassName,
	errorClassName,
	containerClassName,
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	className,
	...props
}: TextAreaProps) => {
	const textAreaRef = useRef<HTMLTextAreaElement>(null);

	const isSuccess = !isError && message;

	const textareaActiveClassName = cn(
		'input',
		`${isError ? 'input-error' : isSuccess ? 'input-success' : 'input-default'}`,
		inputClassName,
	);

	useEffect(() => {
		if (!autoAdjustHeight) return;
		const textarea = textAreaRef.current;
		if (!textarea) return;

		textarea.style.height = '1px';
		textarea.style.height = `${textarea.scrollHeight + 5}px`;
	}, [textAreaRef.current?.textContent, ...autoAdjustHeightTrigger]);

	return (
		<div className={cn('relative flex w-full flex-col gap-1', containerClassName)}>
			{label && <InputLabelElement label={label} name={name} labelClassName={labelClassName} />}

			<div className="size-full">
				{control ? (
					<Controller
						control={control}
						name={name}
						render={({ field: { ref, ...field } }) => (
							<Textarea
								ref={autoAdjustHeight ? textAreaRef : ref}
								id={name}
								onInput={(e: FormEvent<HTMLTextAreaElement>) => {
									e.currentTarget.value = e.currentTarget.value;
								}}
								className={textareaActiveClassName}
								aria-invalid={!!isError}
								aria-describedby={isError ? `${name}-error` : `${name}-success`}
								{...field}
								{...props}
							/>
						)}
					/>
				) : (
					<Textarea
						ref={autoAdjustHeight ? textAreaRef : ref}
						className={textareaActiveClassName}
						{...props}
					/>
				)}
			</div>

			{message && (
				<p
					id={isError ? `${name}-error` : `${name}-success`}
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
