import { ButtonHTMLAttributes, forwardRef } from 'react';
import { VariantProps } from 'class-variance-authority';

import { cn } from '@/utils/theme.util';

import { Button, buttonVariants } from '@/components/ui/button';
import { Loader } from './LoaderElement';

export type ButtonElementProps = {
	title: string;
	asChild?: boolean;
	isLoading?: boolean;
	loaderClassName?: string;
	containerClassName?: string;
} & ButtonHTMLAttributes<HTMLButtonElement> &
	VariantProps<typeof buttonVariants>;

export const ButtonElement = forwardRef<HTMLButtonElement, ButtonElementProps>(
	({ isLoading, title, variant, size, className, loaderClassName, containerClassName, ...props }, ref) => {
		if (isLoading) {
			return (
				<Button
					type={props.type || 'button'}
					disabled={isLoading}
					title={title}
					variant={variant}
					size={size}
					className={cn('relative', className)}
					ref={ref}
					{...props}
				>
					<div
						className={cn(
							'inline-flex items-center justify-center whitespace-nowrap',
							containerClassName,
							isLoading && 'opacity-0',
						)}
					>
						{props.children}
					</div>

					{isLoading && <Loader loaderClassName={cn('absolute inset-0 m-auto', loaderClassName)} />}
				</Button>
			);
		}

		return (
			<Button
				type={props.type || 'button'}
				title={title}
				variant={variant}
				size={size}
				className={cn('relative', className)}
				ref={ref}
				{...props}
			/>
		);
	},
);

ButtonElement.displayName = 'ButtonElement';
