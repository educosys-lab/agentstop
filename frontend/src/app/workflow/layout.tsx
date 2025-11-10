import { ReactNode } from 'react';

import { AutoRedirect } from '@/app/_components/auto-redirect/AutoRedirect';

export default function WorkflowLayout({ children }: { children: ReactNode }) {
	return <AutoRedirect>{children}</AutoRedirect>;
}
