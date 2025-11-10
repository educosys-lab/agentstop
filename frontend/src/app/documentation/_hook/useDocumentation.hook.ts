import { useLayoutEffect, useState } from 'react';
import { redirect, usePathname } from 'next/navigation';

import { URLS } from '@/constants/url.constant';
import { topics } from '../_data/nav.data';

export const useDocumentation = () => {
	const pathname = usePathname();

	const [searchQuery, setSearchQuery] = useState('');
	const [expandedCategory, setExpandedCategory] = useState<string[]>([]);
	const [isSidebarOpen, setIsSidebarOpen] = useState(false);

	let filteredTopics: string[] = [];

	if (searchQuery.trim()) {
		const matchingLinks: string[] = [];

		topics.forEach((topic) => {
			if (topic.searchTerms.some((term) => term.toLowerCase().includes(searchQuery.trim().toLowerCase()))) {
				matchingLinks.push(topic.link);
			}

			topic.subTopics.forEach((subTopic) => {
				if (
					subTopic.searchTerms.some((term) => term.toLowerCase().includes(searchQuery.trim().toLowerCase()))
				) {
					matchingLinks.push(subTopic.link);
				}
			});
		});

		filteredTopics = matchingLinks;
	}

	useLayoutEffect(() => {
		if (pathname === '/documentation') redirect(`${URLS.DOCUMENTATION}/getting-started`);

		const handleResize = () => {
			if (window.innerWidth >= 1024) setIsSidebarOpen(false);
		};

		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	}, []);

	return {
		filteredTopics,
		searchQuery,
		setSearchQuery,
		expandedCategory,
		setExpandedCategory,
		isSidebarOpen,
		setIsSidebarOpen,
	};
};
