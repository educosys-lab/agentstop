'use client';

import { ReactNode } from 'react';

import { useProtectAdminRoute } from '@/hooks/useProtectAdminRoute.hook';

export default function AdminLayout({ children }: { children: ReactNode }) {
	const { showData } = useProtectAdminRoute();

	if (!showData) return null;
	return children;
}
