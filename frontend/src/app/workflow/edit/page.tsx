'use client';

import { useLayoutEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useReactFlow } from '@xyflow/react';
import { toast } from 'sonner';

import { URLS } from '@/constants/url.constant';

import { useWorkflow } from '../_hooks/useWorkflow.hook';
import { useAppDispatch, useAppSelector } from '@/store/hook/redux.hook';
import { workflowActions } from '@/store/features/workflow.slice';

import WorkflowEditor from './_components/WorkflowEditor';

export default function WorkflowEditPage() {
	const searchParams = useSearchParams();
	const { setNodes, setEdges } = useReactFlow();
	const dispatch = useAppDispatch();
	const router = useRouter();

	const workflow = useAppSelector((state) => state.workflowState.workflow);
	const { getWorkflow } = useWorkflow();

	const [isLoading, setIsLoading] = useState(false);

	const workflowId = searchParams.get('workflowId');

	const getCurrentWorkflow = async (id: string) => {
		if (isLoading) return;

		setIsLoading(true);

		const response = await getWorkflow(id);

		if (!response.isError) {
			setNodes(response.data.nodes || []);
			setEdges(response.data.edges || []);
			dispatch(workflowActions.setValue({ workflow: response.data }));
		} else {
			toast.error(response.message || 'Error fetching mission!');
			router.push(URLS.DASHBOARD);
		}

		setIsLoading(false);
	};

	useLayoutEffect(() => {
		if (!workflowId) return;
		getCurrentWorkflow(workflowId);
	}, [workflowId]);

	if (!workflow) return null;
	return (
		<div className="flex h-dvh bg-dark text-foreground">
			<WorkflowEditor />
		</div>
	);
}
