import { ReactNode } from 'react';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';

type HiddenElementProps = {
	children: ReactNode;
};

export const HiddenElement = ({ children }: HiddenElementProps) => {
	return <VisuallyHidden.Root>{children}</VisuallyHidden.Root>;
};
