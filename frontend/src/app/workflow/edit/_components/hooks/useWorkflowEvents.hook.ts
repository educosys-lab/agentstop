import { KeyboardEvent, useCallback } from 'react';
import { useNodes, useReactFlow, useEdges } from '@xyflow/react';
import { v4 as uuid } from 'uuid';
import { toast } from 'sonner';

import { getNewNodePosition } from '../utils/workflow.util';
import { MODAL_IDS } from '@/constants/modal.constant';
import { ReactFlowNode } from '../types/workflow-editor.type';
import { TextNodeVariant } from '../types/nodes/text-node.type';

import { useUndoRedo } from './useUndoRedo.hook';
import { workflowStore } from '@/app/workflow/_store/workflow.store';
import { useWorkflowEditor } from './useWorkflowEditor.hook';
import { useWorkflow } from '@/app/workflow/_hooks/useWorkflow.hook';
import { useAppSelector } from '@/store/hook/redux.hook';
import { useModal } from '@/providers/Modal.provider';
// import { useNodesGrouping } from './useNodesGrouping.hook';

export const useWorkflowEvents = () => {
	const nodes = useNodes() as ReactFlowNode[];
	const edges = useEdges();
	const { setNodes, setEdges } = useReactFlow();
	const { handleChanges, onUndo, onRedo } = useUndoRedo();
	const { selectedNodeIds, selectedEdgeId, isLive } = useWorkflowEditor();
	const { updateCompleteWorkflow } = useWorkflow();
	const { openModal } = useModal();
	// const { onNodesGroup } = useNodesGrouping();

	const workflow = useAppSelector((state) => state.workflowState.workflow);

	const isEditingText = workflowStore((state) => state.isEditingText);

	const getNextPosition = () => {
		const increment = 125;
		const lastPosition = nodes[nodes.length - 1]?.position;
		if (lastPosition) return { x: lastPosition.x + increment, y: lastPosition.y };
		return { x: 0, y: 0 };
	};

	const onSelectAllNodes = () => {
		const updatedNodes = nodes.map((node) => ({ ...node, selected: true }));
		setNodes(updatedNodes);
	};

	const onAddNode = (props: { type: string; category: string; inputValue?: string }) => {
		const { type, category, inputValue } = props;
		const isRichText = type === TextNodeVariant.RICH_TEXT;

		const commonDataProps = { inputValue: inputValue || '' };
		const nodeSize = isRichText ? { width: 200, height: 100 } : { width: 56, height: 56 };

		const newNode = {
			id: uuid(),
			type,
			category,
			position: getNextPosition(),
			...nodeSize,
			data: commonDataProps,
			selected: true,
		} as ReactFlowNode;

		handleChanges();
		setNodes((prev) => {
			const existingNodes = prev.map((node) => ({ ...node, selected: false }));
			return [...existingNodes, newNode];
		});
	};

	const onDeleteNode = () => {
		if (isEditingText) return;
		handleChanges();

		if (selectedNodeIds.length > 0) {
			const updatedNodes = nodes.filter((node) => !selectedNodeIds.includes(node.id));
			setNodes(updatedNodes);
		}

		if (selectedEdgeId) {
			const updatedEdges = edges.filter((edge) => edge.id !== selectedEdgeId);
			setEdges(updatedEdges);
		}
	};

	const onCopyNode = () => {
		if (selectedNodeIds.length < 1) return;

		const nodeToCopy = nodes.filter((node) => selectedNodeIds.includes(node.id));
		if (nodeToCopy.length < 1) return;
		localStorage.setItem('copiedNode', JSON.stringify(nodeToCopy));
	};

	const onPasteNode = () => {
		const copiedNodeStringValue = localStorage.getItem('copiedNode');
		const copiedNodes = JSON.parse(copiedNodeStringValue!);

		if (!copiedNodes || !Array.isArray(copiedNodes)) return;

		const newNodes: ReactFlowNode[] = [];

		copiedNodes.forEach((copiedNode: ReactFlowNode) => {
			const newNodePosition = getNewNodePosition(copiedNode as ReactFlowNode, nodes);

			const newNodeId = `${copiedNode.id}-copy-${Date.now()}`;
			const newNodeData = {
				...copiedNode,
				id: newNodeId,
				position: newNodePosition,
				selected: true,
			};
			newNodes.push(newNodeData);
		});

		handleChanges();
		const updatedNodes = nodes.map((node) => ({ ...node, selected: false }));
		setNodes([...updatedNodes, ...newNodes]);
	};

	const onManualSave = async () => {
		if (!workflow) return;
		const response = await updateCompleteWorkflow({ workflowId: workflow.id, updates: workflow, isLive });
		if (response && !response.isError) toast.success('Workflow updated successfully!');
		else if (response?.message) toast.error(response.message);
	};

	const openCenterNodeList = () => {
		openModal(MODAL_IDS.CENTER_NODE_LIST);
	};

	const handleKeyboardEvent = useCallback(
		(event: KeyboardEvent<HTMLDivElement>) => {
			if (isEditingText || isLive) return;

			if ((event.ctrlKey || event.metaKey) && event.key === 'o') {
				event.preventDefault();
				openCenterNodeList();
			}
			if ((event.ctrlKey || event.metaKey) && event.key === 's') {
				event.preventDefault();
				onManualSave();
			}
			if ((event.ctrlKey || event.metaKey) && event.key === 'a') {
				event.preventDefault();
				onSelectAllNodes();
			}
			if (event.key === 'Delete') {
				event.preventDefault();
				onDeleteNode();
			}
			if ((event.ctrlKey || event.metaKey) && event.key === 'c') {
				event.preventDefault();
				onCopyNode();
			}
			if ((event.ctrlKey || event.metaKey) && event.key === 'v') {
				event.preventDefault();
				onPasteNode();
			}
			if ((event.ctrlKey || event.metaKey) && event.key === 'z') {
				event.preventDefault();
				onUndo();
			}
			if ((event.ctrlKey || event.metaKey) && event.shiftKey && (event.key === 'z' || event.key === 'y')) {
				event.preventDefault();
				onRedo();
			}
			// if ((event.ctrlKey || event.metaKey) && event.key === 'g') {
			// 	onNodesGroup();
			// }
		},
		[
			isEditingText,
			openCenterNodeList,
			onManualSave,
			onSelectAllNodes,
			onDeleteNode,
			onCopyNode,
			onPasteNode,
			onUndo,
			onRedo,
		],
	);

	return {
		onSelectAllNodes,
		onAddNode,
		onDeleteNode,
		onCopyNode,
		onPasteNode,
		onManualSave,
		openCenterNodeList,
		handleKeyboardEvent,
	};
};
