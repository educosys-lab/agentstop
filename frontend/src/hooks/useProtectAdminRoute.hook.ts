import { useLayoutEffect, useState } from 'react';
import { redirect } from 'next/navigation';

import { URLS } from '@/constants/url.constant';

import { useAppSelector } from '@/store/hook/redux.hook';

export const useProtectAdminRoute = () => {
	const user = useAppSelector((state) => state.userState.user);

	const [showData, setShowData] = useState(false);

	useLayoutEffect(() => {
		if (!user) redirect(URLS.DASHBOARD);
		if (!user.isAdmin) redirect(URLS.HOME);
		setShowData(true);
	}, [user]);

	return { showData };
};
