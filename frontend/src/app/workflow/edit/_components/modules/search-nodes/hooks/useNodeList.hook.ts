import { WorkflowNodeListProps } from '../../../types/node-list.type';

import { useWorkflowEvents } from '../../../hooks/useWorkflowEvents.hook';
import { workflowStoreSynced } from '@/app/workflow/_store/workflow-synced.store';

export const useNodeList = () => {
	const { onAddNode } = useWorkflowEvents();
	const nodesData = workflowStoreSynced((state) => state.nodesData);

	const visibleNodes = nodesData ? nodesData.filter((tool) => !tool.metadata.hidden) : [];

	const toolsNodeElements: WorkflowNodeListProps[] = visibleNodes.map((tool) => ({
		name: tool.metadata.label,
		onClick: () =>
			onAddNode({
				type: tool.metadata.type,
				category: tool.metadata.category,
				inputValue: tool.metadata.label,
			}),
		category: tool.metadata.category,
		description: tool.metadata.description,
		image: tool.metadata.icon,
		search: tool.metadata.type.toLowerCase().split(' '),
	}));
	return { toolsNodeElements };
};
