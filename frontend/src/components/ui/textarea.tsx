import { forwardRef, TextareaHTMLAttributes } from 'react';

import { cn } from '@/utils/theme.util';

export type TextareaProps = {} & TextareaHTMLAttributes<HTMLTextAreaElement>;

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => {
	return (
		<textarea
			className={cn(
				'flex min-h-24 w-full rounded-md border-2 border-border bg-background px-3 py-2 text-sm ring-0 ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:bg-inherit disabled:opacity-50',
				className,
			)}
			ref={ref}
			{...props}
		/>
	);
});
Textarea.displayName = 'Textarea';

export { Textarea };
