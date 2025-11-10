import { ReactNode } from 'react';

import { CHAT_DEFAULT_METADATA } from './seo';

import { AutoRedirect } from '@/app/_components/auto-redirect/AutoRedirect';

export const metadata = CHAT_DEFAULT_METADATA;

export default function InteractLayout({ children }: { children: ReactNode }) {
	return <AutoRedirect>{children}</AutoRedirect>;
}
