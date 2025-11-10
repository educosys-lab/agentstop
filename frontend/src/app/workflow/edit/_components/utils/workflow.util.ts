import { ReactFlowNode } from '../types/workflow-editor.type';

export const getNewNodePosition = (copiedNode: ReactFlowNode, allNodes: ReactFlowNode[]) => {
	const copiedNodePosition = copiedNode.position;
	let newNodePosition = { x: copiedNodePosition.x + 10, y: copiedNodePosition.y + 10 };
	let isPositionTaken = true;

	while (isPositionTaken) {
		const isNodeAtXPosition = allNodes.find((node) => node.position.x === newNodePosition.x);
		const isNodeAtYPosition = allNodes.find((node) => node.position.y === newNodePosition.y);

		if (!isNodeAtXPosition && !isNodeAtYPosition) {
			isPositionTaken = false;
		} else {
			newNodePosition = { x: newNodePosition.x + 10, y: newNodePosition.y + 10 };
		}
	}

	return newNodePosition;
};
