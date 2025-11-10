import { useCallback } from 'react';
import {
	addEdge,
	getOutgoers,
	IsValidConnection,
	MarkerType,
	OnConnect,
	useEdges,
	useNodes,
	useReactFlow,
} from '@xyflow/react';

import { groupNodes } from '../types/nodes/group-node.type';

import { ReactFlowNode } from '../types/workflow-editor.type';
import { workflowStore } from '@/app/workflow/_store/workflow.store';
import { useAppSelector } from '@/store/hook/redux.hook';

export const useWorkflowEditor = () => {
	const nodes = useNodes() as ReactFlowNode[];
	const edges = useEdges();
	const { setEdges } = useReactFlow();
	const { getNodes, getEdges } = useReactFlow();

	const workflow = useAppSelector((state) => state.workflowState.workflow);
	const setWSValue = workflowStore((state) => state.setWSValue);

	const selectedNodes = nodes.filter((node) => node.selected);
	const selectedNodeIds = nodes.filter((node) => node.selected)?.map((node) => node.id);
	const selectedEdgeId = edges.find((edge) => edge.selected)?.id;

	const selectedNodeType =
		selectedNodeIds.length === 1 ? nodes.find((node) => node.selected)?.type || undefined : undefined;

	const isGroupNodeSelected = Object.keys(groupNodes).includes(nodes.find((node) => node.selected)?.type || '');

	const isLive = workflow && workflow.status === 'live' ? true : false;
	const isResponderPresent = nodes.find((node) => node.category === 'Responder');
	const hasResponder = isResponderPresent && edges.some((edge) => edge.target === isResponderPresent.id);

	const onConnect: OnConnect = useCallback(
		(params) =>
			setEdges((eds) => addEdge({ ...params, type: 'floating', markerEnd: { type: MarkerType.Arrow } }, eds)),
		[setEdges],
	);

	const isValidConnection: IsValidConnection = useCallback(
		(connection) => {
			const nodes = getNodes() as ReactFlowNode[];
			const edges = getEdges();

			const source = nodes.find((node) => node.id === connection.source) as ReactFlowNode;
			const target = nodes.find((node) => node.id === connection.target) as ReactFlowNode;

			const hasCycle = (node: ReactFlowNode, visited = new Set()) => {
				if (visited.has(node.id)) return false;

				visited.add(node.id);

				for (const outgoer of getOutgoers(node, nodes, edges)) {
					if (outgoer.id === connection.source) return true;
					if (hasCycle(outgoer as ReactFlowNode, visited)) return true;
				}
			};

			const isFormingCycle = hasCycle(target);
			if (isFormingCycle) setWSValue({ nodesConnectionWarning: 'Cyclic connections are not allowed!' });

			if (target.id === connection.source) return false;
			if (isFormingCycle) return false;

			if (target.category === 'Trigger') {
				setWSValue({ nodesConnectionWarning: 'Trigger nodes can only be a starting node!' });
				return false;
			}

			if (source.type === 'responder') {
				setWSValue({ nodesConnectionWarning: 'Responder nodes can only be at the end!' });
				return false;
			}

			if (source.category && target.category) {
				if (source.category === 'Tool' && target.type !== 'agent') {
					setWSValue({ nodesConnectionWarning: 'Tools can only be attached with Agent!' });
					return false;
				}
				if (target.category === 'Tool' && source.type !== 'agent') {
					setWSValue({ nodesConnectionWarning: 'Tools can only be attached with Agent!' });
					return false;
				}
			}

			const allToolNodeIds = nodes.filter((node) => node.category === 'Tool').map((node) => node.id);

			const allSourceNodeIds = edges
				.filter((edge) => !allToolNodeIds.includes(edge.source) && !allToolNodeIds.includes(edge.target))
				.map((edge) => edge.source);

			const allTargetNodeIds = edges
				.filter((edge) => !allToolNodeIds.includes(edge.source) && !allToolNodeIds.includes(edge.target))
				.map((edge) => edge.target);

			if (!target || !source) return false;

			if (
				!(source.category === 'Tool' && target.type === 'agent') &&
				!(target.category === 'Tool' && source.type === 'agent')
			) {
				if (allSourceNodeIds.includes(source.id)) {
					setWSValue({ nodesConnectionWarning: 'This node already have an attached flow!' });
					return false;
				}
				if (allTargetNodeIds.includes(target.id)) {
					setWSValue({ nodesConnectionWarning: 'This node already have an attached flow!' });
					return false;
				}
			}

			return true;
		},
		[getNodes, getEdges],
	);

	return {
		selectedNodes,
		selectedNodeIds,
		selectedEdgeId,
		selectedNodeType,
		isGroupNodeSelected,
		onConnect,
		isValidConnection,
		isLive,
		hasResponder,
	};
};
