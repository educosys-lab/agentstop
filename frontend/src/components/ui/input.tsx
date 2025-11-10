import { forwardRef, InputHTMLAttributes } from 'react';

import { cn } from '@/utils/theme.util';

export type InputProps = {} & InputHTMLAttributes<HTMLInputElement>;

const Input = forwardRef<HTMLInputElement, InputProps>(({ className, type, ...props }, ref) => {
	return (
		<input
			type={type}
			className={cn(
				'placeholder:text-muted-foreground-light flex min-h-11 w-full rounded-md border border-border bg-background px-3 py-2 text-sm ring-0 file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none disabled:cursor-not-allowed disabled:bg-inherit disabled:opacity-50',
				className,
			)}
			ref={ref}
			{...props}
		/>
	);
});
Input.displayName = 'Input';

export { Input };
