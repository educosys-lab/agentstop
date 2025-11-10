'use client';

import { ReactNode, useEffect } from 'react';
import { redirect } from 'next/navigation';

import { useAppSelector } from '@/store/hook/redux.hook';
import { URLS } from '@/constants/url.constant';

export default function DashboardLayout({ children }: { children: ReactNode }) {
	const user = useAppSelector((state) => state.userState.user);

	useEffect(() => {
		if (user) redirect(URLS.DASHBOARD);
	}, [user]);

	return children;
}
