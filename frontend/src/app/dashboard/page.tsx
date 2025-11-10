'use client';

import dynamic from 'next/dynamic';

import NewWorkflow from './_components/new-workflow/NewWorkflow';
import List from './_components/workflow-list/List';

const NavBar = dynamic(() => import('../_components/navigation/NavBar'));

export default function DashboardPage() {
	return (
		<>
			<NavBar page={'dashboard'} />
			<List />
			<NewWorkflow />
		</>
	);
}
