'use client';

import { FormEvent, InputHTMLAttributes, ReactNode, useState } from 'react';
import { Control, Controller } from 'react-hook-form';
import { EyeIcon, EyeOffIcon } from 'lucide-react';

import { cn } from '@/utils/theme.util';

import { Input } from '@/components/ui/input';
import { InputLabelElement } from '@/components/elements/InputLabelElement';

type InputPropsWithControl = { control: Control<any>; name: string };
type InputPropsWithoutControl = { control?: never; name?: never };

type InputProps = InputHTMLAttributes<HTMLInputElement> &
	(InputPropsWithControl | InputPropsWithoutControl) & {
		label?: ReactNode;
		message?: string;
		isError?: boolean;
		innerElement?: ReactNode;
		inputClassName?: string;
		labelClassName?: string;
		errorClassName?: string;
		containerClassName?: string;
	};

const passwordIconClassName = 'cursor-pointer size-5 absolute inset-[0_10px_0_auto] my-auto text-muted-foreground';

export const InputElement = ({
	control,
	name,
	label,
	message,
	isError,
	innerElement,
	type,
	inputClassName,
	labelClassName,
	errorClassName,
	containerClassName,
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	className,
	...props
}: InputProps) => {
	const [isPasswordVisible, setIsPasswordVisible] = useState(false);

	const isSuccess = !isError && message;

	const inputActiveClassName = cn(
		'input',
		`${isError ? 'input-error' : isSuccess ? 'input-success' : 'input-default'}`,
		type === 'password' && 'pr-9',
		inputClassName,
	);

	return (
		<div className={cn('relative flex w-full flex-col gap-1', containerClassName)}>
			{label && <InputLabelElement label={label} name={name} labelClassName={labelClassName} />}

			<div className="relative size-full">
				{control ? (
					<Controller
						control={control}
						name={name}
						render={({ field: { ref, ...field } }) => (
							<Input
								ref={ref}
								id={name}
								onInput={(e: FormEvent<HTMLInputElement>) => {
									e.currentTarget.value = e.currentTarget.value;
								}}
								type={type === 'password' && isPasswordVisible ? 'text' : type}
								className={inputActiveClassName}
								aria-invalid={!!isError}
								aria-describedby={isError ? `${name}-error` : `${name}-success`}
								{...field}
								{...props}
							/>
						)}
					/>
				) : (
					<Input
						type={type === 'password' && isPasswordVisible ? 'text' : type}
						className={inputActiveClassName}
						{...props}
					/>
				)}

				{type === 'password' &&
					(isPasswordVisible ? (
						<EyeIcon onClick={() => setIsPasswordVisible(false)} className={passwordIconClassName} />
					) : (
						<EyeOffIcon onClick={() => setIsPasswordVisible(true)} className={passwordIconClassName} />
					))}

				{innerElement}
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
