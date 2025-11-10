import { ButtonHTMLAttributes, forwardRef } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/utils/theme.util';

export const buttonCommonClasses = `size-max cursor-pointer inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50`;

const buttonVariants = cva('', {
	variants: {
		variant: {
			primary: 'gradient-primary focus-visible:outline-primary text-primary-foreground',
			success: 'bg-success hover:bg-success-dark focus-visible:outline-success text-success-foreground',
			warn: 'bg-warn hover:bg-warn-dark focus-visible:outline-warn text-warn-foreground',
			destructive:
				'bg-destructive hover:bg-destructive-dark focus-visible:outline-destructive text-destructive-foreground',
			muted: 'bg-muted hover:bg-muted-dark focus-visible:outline-muted text-muted-foreground',
			outline:
				'bg-transparent hover:bg-background focus-visible:outline-primary text-primary-foreground border-2 border-primary hover:border-primary-dark',
			ghost: 'bg-transparent hover:bg-muted focus-visible:outline-muted text-muted-foreground',
			link: 'text-primary underline-offset-4 hover:underline',
			wrapper: 'disabled:pointer-events-none disabled:opacity-50 cursor-pointer',
		},
		size: {
			default: 'h-11 px-4',
			sm: 'h-9 px-3',
			lg: 'h-12 px-8',
			icon: 'size-10',
			wrapper: '',
		},
	},
	defaultVariants: { variant: 'primary', size: 'default' },
});

export type ButtonProps = {
	asChild?: boolean;
} & ButtonHTMLAttributes<HTMLButtonElement> &
	VariantProps<typeof buttonVariants>;

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
	({ className, variant, size, asChild = false, ...props }, ref) => {
		const Comp = asChild ? Slot : 'button';

		return (
			<Comp
				className={cn(
					buttonCommonClasses,
					buttonVariants({ variant, size: variant === 'wrapper' ? 'wrapper' : size, className }),
				)}
				ref={ref}
				{...props}
			/>
		);
	},
);
Button.displayName = 'Button';

export { Button, buttonVariants };
