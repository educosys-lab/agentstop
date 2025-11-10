import { useCallback, useEffect, useRef, useState } from 'react';
import {
	EdgeChange,
	NodeChange,
	useEdgesState,
	useNodesState,
	Edge as ReactFlowEdge,
	EdgeAddChange,
} from '@xyflow/react';
import { toast } from 'sonner';

import { ReactFlowNode } from '../types/workflow-editor.type';
import { groupNodes } from '../types/nodes/group-node.type';
import { textNodes } from '../types/nodes/text-node.type';
import { WorkflowToolDataType } from '../types/tool-node-config.type';

import { nodeBuilder } from '../modules/nodes/NodeBuilder';

import { useUndoRedo } from '../hooks/useUndoRedo.hook';
import { useAppSelector } from '@/store/hook/redux.hook';
import { useTimeout } from '@/hooks/useTimeout.hook';
import { useWorkflow } from '@/app/workflow/_hooks/useWorkflow.hook';
import { workflowStore } from '@/app/workflow/_store/workflow.store';
import { useWorkflowEditor } from './useWorkflowEditor.hook';
import { useTemplateCustom } from '@/app/template/_hook/useTemplateCustom.hook';
import { workflowStoreSynced } from '@/app/workflow/_store/workflow-synced.store';

export const useReactFlowCustom = () => {
	const timeout = useTimeout();
	const workflow = useAppSelector((state) => state.workflowState.workflow);
	const { handleChanges } = useUndoRedo();
	const { updateAndSyncWorkflow, getAllNodes } = useWorkflow();
	const { isLive } = useWorkflowEditor();
	// Just calling this hook to trigger the useEffect
	useTemplateCustom();

	const nodesConnectionWarning = workflowStore((state) => state.nodesConnectionWarning);
	const isMouseDown = workflowStore((state) => state.isMouseDown);
	const setWSValue = workflowStore((state) => state.setWSValue);

	const isHydrated = workflowStoreSynced((state) => state.isHydrated);
	const nodesData = workflowStoreSynced((state) => state.nodesData);
	const lastUpdated = workflowStoreSynced((state) => state.lastUpdated);
	const setWSSyncedValue = workflowStoreSynced((state) => state.setWSSyncedValue);

	const [nodes, , onNodesChange] = useNodesState<ReactFlowNode>(workflow?.nodes || []);
	const [edges, setEdges, onEdgesChange] = useEdgesState<ReactFlowEdge>(workflow?.edges || []);
	const [workflowNodes, setWorkflowNodes] = useState<{ [key: string]: () => JSX.Element } | null>(
		buildWorkflowNodes(nodesData),
	);

	const workflowEditorRef = useRef<HTMLDivElement>(null);

	const modifiedOnNodesChange = useCallback(
		(changes: NodeChange<ReactFlowNode>[]) => {
			handleChanges();
			onNodesChange(changes);
		},
		[handleChanges, onNodesChange],
	);

	const modifiedOnEdgesChange = useCallback(
		(changes: EdgeChange[]) => {
			const update = (changes: EdgeChange[]) => {
				handleChanges();
				onEdgesChange(changes);
				return;
			};

			const connect = (updatedChange?: EdgeChange[]) => {
				if (changes.length !== 1 || changes[0].type !== 'add') return update(changes);

				const actualChange: any[] = updatedChange || changes;

				actualChange.forEach((change: any, index) => {
					if (!actualChange[index]?.item?.markerEnd) return;
					actualChange[index].item.markerEnd = { type: 'arrowclosed' };
				});

				return update(actualChange);
			};

			if (changes.length !== 1 || changes[0].type !== 'add') return connect();

			const selectedItem = changes[0];
			const source = nodes.find((node) => node.id === selectedItem.item.source);
			const target = nodes.find((node) => node.id === selectedItem.item.target);

			if (source && target) {
				const connectTool = () => {
					if ((changes[0] as EdgeAddChange).item) {
						const updatedItem = (changes[0] as EdgeAddChange).item;
						updatedItem.animated = true;
						delete updatedItem.markerEnd;
						return connect([{ ...changes[0], item: updatedItem } as any]);
					}
				};

				if (
					(['Agent'].includes(source.category) && ['Tool'].includes(target.category)) ||
					(['Tool'].includes(source.category) && ['Agent'].includes(target.category))
				) {
					return connectTool();
				}
			}

			return connect();
		},
		[handleChanges, onEdgesChange],
	);

	const onMouseDown = (value: boolean) => setWSValue({ isMouseDown: value });

	function buildWorkflowNodes(nodesData: WorkflowToolDataType[] | null) {
		if (!nodesData) return null;

		try {
			const nodes = nodesData.reduce(
				(acc, curr) => {
					if (curr.metadata.hidden) return acc;
					const node = nodeBuilder(curr.metadata);
					acc[curr.metadata.type] = node;
					return acc;
				},
				{} as { [key: string]: () => JSX.Element },
			);

			return { ...textNodes, ...groupNodes, ...nodes };
		} catch (error) {
			console.error('Error building mission nodes:', error);
			return null;
		}
	}

	const getNodes = async () => {
		const nodesResponse = await getAllNodes();
		if (!nodesResponse.data) return null;

		const allNodes = buildWorkflowNodes(nodesResponse.data);
		if (!allNodes) return null;

		setWorkflowNodes(allNodes);
		setWSSyncedValue({ nodesData: nodesResponse.data, lastUpdated: Date.now() });
	};

	useEffect(() => {
		if (!isMouseDown && nodesConnectionWarning) {
			toast.error(nodesConnectionWarning);
			setWSValue({ nodesConnectionWarning: '' });
		}
	}, [nodesConnectionWarning, isMouseDown]);

	useEffect(() => {
		if (!workflow) return;

		if (
			JSON.stringify(workflow.nodes) === JSON.stringify(nodes) &&
			JSON.stringify(workflow.edges) === JSON.stringify(edges)
		) {
			return;
		}

		const nodeIds = nodes.map((node) => node.id);
		const validEdges: ReactFlowEdge[] = [];

		edges.forEach((edge) => {
			if (!nodeIds.includes(edge.source) || !nodeIds.includes(edge.target)) return;
			validEdges.push(edge);
		});

		if (JSON.stringify(edges) !== JSON.stringify(validEdges)) setEdges(validEdges);

		timeout(async () => {
			await updateAndSyncWorkflow({ updates: { nodes, edges: validEdges }, isLive });
		}, 1000);
	}, [nodes, edges]);

	useEffect(() => {
		if (typeof window === 'undefined') return;

		window.addEventListener('mousedown', () => onMouseDown(true));
		window.addEventListener('mouseup', () => onMouseDown(false));

		return () => {
			window.removeEventListener('mousedown', () => onMouseDown(true));
			window.removeEventListener('mouseup', () => onMouseDown(false));
		};
	}, [onMouseDown]);

	useEffect(() => {
		if (!isHydrated) return;
		if (process.env.NEXT_PUBLIC_ENV !== 'production') {
			getNodes();
			return;
		}

		const refetchInterval = 1 * 60 * 60 * 1000; // 1 hour
		const timeNow = Date.now();
		const shouldRefetch = timeNow - (lastUpdated || 0) > refetchInterval;

		if (shouldRefetch || !nodesData) getNodes();
	}, [isHydrated]);

	return {
		nodes,
		edges,
		modifiedOnNodesChange,
		modifiedOnEdgesChange,
		workflowEditorRef,
		workflowNodes,
	};
};
