import { useCallback } from 'react';
import { getNodesBounds, useNodes, useReactFlow } from '@xyflow/react';

import { getId } from '../utils/group.util';
import { GroupNodeVariant } from '../types/nodes/group-node.type';
import { ReactFlowNode } from '../types/workflow-editor.type';

import { useWorkflowEditor } from './useWorkflowEditor.hook';

const padding = 30;

export const useNodesGrouping = () => {
	const nodes = useNodes() as ReactFlowNode[];
	const { setNodes } = useReactFlow();

	const { selectedNodeIds } = useWorkflowEditor();

	const selectedNodes = nodes.filter((node) => node.selected && !node.parentId);
	const currParentId = selectedNodes.find((node) => node.type === GroupNodeVariant.GROUP)?.id;

	const onNodesGroup = () => {
		const rectOfNodes = getNodesBounds(selectedNodes);
		const groupId = getId(GroupNodeVariant.GROUP);
		const parentPosition = {
			x: rectOfNodes.x,
			y: rectOfNodes.y,
		};

		const groupNode: ReactFlowNode = {
			id: groupId,
			type: GroupNodeVariant.GROUP,
			category: 'System',
			position: parentPosition,
			dragging: false,
			style: {
				width: rectOfNodes.width + padding * 2,
				height: rectOfNodes.height + padding * 2,
			},
			data: { inputValue: '' },
			zIndex: 3,
			selected: false,
		};

		const nextNodes = nodes.filter((node) => !selectedNodeIds.includes(node.id));

		const childNodes = selectedNodes.map((node) => ({
			...node,
			position: {
				x: node.position.x - parentPosition.x + padding,
				y: node.position.y - parentPosition.y + padding,
			},
			extent: GroupNodeVariant.PARENT as const,
			parentId: groupId,
			selected: false,
			dragging: true,
			zIndex: 4,
		}));

		nextNodes.push(groupNode);
		nextNodes.push(...childNodes);
		setNodes(nextNodes);
	};

	const onNodesUngroup = useCallback(() => {
		const childNodeIds = nodes.filter((n) => n.parentId === currParentId).map((n) => n.id);

		const nextNodes = nodes.map((n) => {
			if (childNodeIds.includes(n.id) && n.parentId) {
				const parentNode = nodes.find((parent) => parent.id === n.parentId);
				return {
					...n,
					position: {
						x: n.position.x + (parentNode?.position.x ?? 0),
						y: n.position.y + (parentNode?.position.y ?? 0),
					},
					expandParent: undefined,
					parentId: undefined,
				};
			}
			return n;
		});

		setNodes(nextNodes.filter((n) => !currParentId || n.id !== currParentId));
	}, [setNodes, nodes]);

	return { onNodesGroup, onNodesUngroup };
};
