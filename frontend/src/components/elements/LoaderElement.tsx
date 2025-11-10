import { Loader2Icon } from 'lucide-react';

import { cn } from '@/utils/theme.util';

type LoaderElementProps = {
	loaderClassName?: string;
};

export const Loader = ({ loaderClassName }: LoaderElementProps) => {
	return <Loader2Icon className={cn('size-6 animate-spin', loaderClassName)} />;
};
