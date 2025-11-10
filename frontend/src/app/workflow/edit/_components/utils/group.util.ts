import { GroupNodeVariant } from '../types/nodes/group-node.type';
import { ReactFlowNode } from '../types/workflow-editor.type';

export const getId = (prefix: string) => `${prefix}_${Math.random() * 10000}`;

export const sortNodes = (a: ReactFlowNode, b: ReactFlowNode): number => {
	if (a.type === GroupNodeVariant.GROUP && b.type !== GroupNodeVariant.GROUP) {
		return -1;
	}
	if (a.type !== GroupNodeVariant.GROUP && b.type === GroupNodeVariant.GROUP) {
		return 1;
	}
	if (a.type === GroupNodeVariant.GROUP && b.type === GroupNodeVariant.GROUP) {
		return 0;
	}
	return 0;
};

export const getNodePositionInsideParent = (node: Partial<ReactFlowNode>, groupNode: ReactFlowNode) => {
	const position = node.position ?? { x: 0, y: 0 };
	const nodeWidth = node.measured?.width ?? 0;
	const nodeHeight = node.measured?.height ?? 0;
	const groupWidth = groupNode.measured?.width ?? 0;
	const groupHeight = groupNode.measured?.height ?? 0;

	if (position.x < groupNode.position.x) {
		position.x = 0;
	} else if (position.x + nodeWidth > groupNode.position.x + groupWidth) {
		position.x = groupWidth - nodeWidth;
	} else {
		position.x = position.x - groupNode.position.x;
	}

	if (position.y < groupNode.position.y) {
		position.y = 0;
	} else if (position.y + nodeHeight > groupNode.position.y + groupHeight) {
		position.y = groupHeight - nodeHeight;
	} else {
		position.y = position.y - groupNode.position.y;
	}

	return position;
};
