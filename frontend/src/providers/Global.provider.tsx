'use client';

import { usePathname } from 'next/navigation';
import { ReactNode, useEffect } from 'react';
import { toast } from 'sonner';

import { useWorkflow } from '@/app/workflow/_hooks/useWorkflow.hook';
import { useAppDispatch, useAppSelector } from '@/store/hook/redux.hook';
import { workflowActions } from '@/store/features/workflow.slice';

import Signin from '@/app/_auth/Signin';
import Signup from '@/app/_auth/Signup';
import Chatbot from '@/app/_components/chatbot/Chatbot';
import { useUser } from '@/hooks/useUser.hook';
import { userActions } from '@/store/features/user.slice';

export const GlobalProvider = ({ children }: { children: ReactNode }) => {
	const pathname = usePathname();
	const dispatch = useAppDispatch();
	const userState = useAppSelector((state) => state.userState);

	const { getUser } = useUser();
	const { getUserGlobalMissionStats } = useWorkflow();

	const fetchGlobalMissionStats = async () => {
		const missionCountResponse = await getUserGlobalMissionStats();

		if (!missionCountResponse.isError) {
			dispatch(
				workflowActions.setValue({
					currentExecutions: missionCountResponse.data.currentExecutions,
					totalExecutions: missionCountResponse.data.totalExecutions,
				}),
			);
		} else {
			toast.error(missionCountResponse.message || 'Error fetching mission stats!');
		}
	};

	const refreshUser = async () => {
		if (!userState.user) return;

		const userResponse = await getUser(userState.user.email);
		if (!userResponse.isError) {
			const { ssoConfig, files, ...rest } = userResponse.data;
			dispatch(userActions.setValue({ user: rest, ssoConfig, files, lastSynced: Date.now() }));
		}
	};

	useEffect(() => {
		if (!userState.user) return;
		if (pathname === '/dashboard') fetchGlobalMissionStats();
	}, [userState.user, pathname]);

	useEffect(() => {
		if (!userState.user) return;

		const now = Date.now();
		if (!userState.lastSynced || userState.lastSynced < now) refreshUser();
	}, []);

	return (
		<>
			<Signin />
			<Signup />
			<Chatbot />
			{children}
		</>
	);
};
