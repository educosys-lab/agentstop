'use client';

import { ReactNode, useLayoutEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { useAppSelector } from '@/store/hook/redux.hook';
import { URLS } from '@/constants/url.constant';

export const AutoRedirect = ({ children }: { children: ReactNode }) => {
	const router = useRouter();
	const user = useAppSelector((state) => state.userState.user);

	const [showData, setShowData] = useState(false);

	useLayoutEffect(() => {
		if (!user) router.replace(URLS.HOME);
		setShowData(true);
	}, [user, router]);

	if (!showData) return null;
	return children;
};
