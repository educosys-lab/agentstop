import {
	ClipboardIcon,
	CopyIcon,
	// SlidersVerticalIcon,
	Trash2Icon,
	// GroupIcon,
	// UngroupIcon
} from 'lucide-react';

import { useWorkflowEvents } from '../../../hooks/useWorkflowEvents.hook';
// import { useWorkflowEditor } from './useWorkflowEditor.hook';
// import { useNodesGrouping } from './useNodesGrouping.hook';

export const useWorkflowNodeContextMenu = () => {
	// const { selectedNodeIds, isGroupNodeSelected } = useWorkflowEditor();
	// const { onNodesGroup, onNodesUngroup } = useNodesGrouping();

	const { onDeleteNode, onCopyNode, onPasteNode } = useWorkflowEvents();

	const workflowNodeMenuItems = [
		{ id: '1', label: 'Delete', onClick: onDeleteNode, icon: Trash2Icon },
		{ id: '2', label: 'Copy', onClick: onCopyNode, icon: CopyIcon },
		{ id: '3', label: 'Paste', onClick: onPasteNode, icon: ClipboardIcon },
		// ...(selectedNodeIds.length > 1 || isGroupNodeSelected
		// 	? [
		// 			{
		// 				id: '4',
		// 				label: `${isGroupNodeSelected ? 'Ungroup' : 'Group'}`,
		// 				onClick: isGroupNodeSelected ? onNodesUngroup : onNodesGroup,
		// 				icon: isGroupNodeSelected ? UngroupIcon : GroupIcon,
		// 			},
		// 		]
		// 	: []),
	];

	return { workflowNodeMenuItems };
};
