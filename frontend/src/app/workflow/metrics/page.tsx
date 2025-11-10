'use client';

import { redirect } from 'next/navigation';
import { useLayoutEffect } from 'react';

import { URLS } from '@/constants/url.constant';

import { useAppSelector } from '@/store/hook/redux.hook';

// import { FiArrowLeft } from 'react-icons/fi';

// import { mockWorkflowData } from '../_data/workflow.data';

// import { LinkElement } from '@/components/elements/LinkElement';
// import QuickStats from './_components/quick-stats/QuickStats';
// import Logs from './_components/logs/Logs';
// import Revenue from './_components/revenue/Revenue';
// import Graph from './_components/graph/Graph';

export default function WorkflowMetrics() {
	const user = useAppSelector((state) => state.userState.user);

	// return (
	// 	<div className="min-h-dvh bg-dark p-8 text-foreground">
	// 		<div className="mx-auto max-w-7xl">
	// 			<div className="mb-8">
	// 				<LinkElement
	// 					href="/dashboard"
	// 					title="Back to Dashboard"
	// 					className="flex items-center text-primary-light hover:text-blue-300"
	// 				>
	// 					<FiArrowLeft className="mr-2" /> Back to Dashboard
	// 				</LinkElement>

	// 				<h1 className="gradient-primary mt-4 bg-clip-text text-4xl font-bold text-transparent">
	// 					{mockWorkflowData.name}
	// 				</h1>
	// 			</div>

	// 			<QuickStats />

	// 			<Graph />

	// 			<Logs />

	// 			<Revenue />
	// 		</div>
	// 	</div>
	// );

	useLayoutEffect(() => {
		if (user) redirect(URLS.DASHBOARD);
		else redirect(URLS.HOME);
	}, []);

	return null;
}
