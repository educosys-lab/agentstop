import { useState } from 'react';

import { WorkflowNodeListProps } from '../../../types/node-list.type';

import { useNodeList } from './useNodeList.hook';

export const useNodesSearch = () => {
	const { toolsNodeElements } = useNodeList();

	const [searchQuery, setSearchQuery] = useState('');
	const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

	const filteredTools = toolsNodeElements.filter((node) => {
		const nameMatch = node.name.toLowerCase().includes(searchQuery.toLowerCase());
		const descriptionMatch = node.description.toLowerCase().includes(searchQuery.toLowerCase());
		const categoryMatch = node.category.toLowerCase().includes(searchQuery.toLowerCase());
		return nameMatch || descriptionMatch || categoryMatch;
	});

	const activeTools = filteredTools.length > 0 ? filteredTools : searchQuery ? [] : toolsNodeElements;

	const isNoMatch = activeTools.length === 0;

	const categorizedTools = activeTools.reduce(
		(acc, node) => {
			const category = node.category || 'Undefined';
			if (!acc[category]) acc[category] = [node];
			else acc[category].push(node);
			return acc;
		},
		{} as { [category: string]: WorkflowNodeListProps[] },
	);

	const toggleExpandedCategory = (category: string) => {
		if (expandedCategories.includes(category)) {
			setExpandedCategories((prev) => prev.filter((cat) => cat !== category));
		} else {
			setExpandedCategories((prev) => [...prev, category]);
		}
	};

	return {
		searchQuery,
		setSearchQuery,
		categorizedTools,
		isNoMatch,
		expandedCategories,
		toggleExpandedCategory,
	};
};
