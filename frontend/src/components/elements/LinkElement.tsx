import { AnchorHTMLAttributes, forwardRef } from 'react';
import Link from 'next/link';
import { VariantProps } from 'class-variance-authority';

import { buttonCommonClasses, buttonVariants } from '@/components/ui/button';
import { cn } from '@/utils/theme.util';

export type LinkElementProps = AnchorHTMLAttributes<HTMLAnchorElement> & { title: string } & VariantProps<
		typeof buttonVariants
	>;

export const LinkElement = forwardRef<HTMLAnchorElement, LinkElementProps>(
	({ className, variant = 'wrapper', size, title, ...props }, ref) => {
		if (variant === 'wrapper') {
			return (
				<Link
					ref={ref}
					href={props.href || ''}
					className={cn(buttonVariants({ variant, size: size || 'wrapper', className }), 'cursor-pointer')}
					title={title}
					aria-label={title}
					{...props}
				/>
			);
		}

		return (
			<Link
				ref={ref}
				href={props.href || ''}
				className={cn(buttonCommonClasses, buttonVariants({ variant, size, className }), 'cursor-pointer')}
				title={title}
				aria-label={title}
				{...props}
			/>
		);
	},
);

LinkElement.displayName = 'LinkElement';
