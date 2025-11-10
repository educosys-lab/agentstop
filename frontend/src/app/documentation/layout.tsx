'use client';

import { ReactNode } from 'react';
import dynamic from 'next/dynamic';
import { ArrowLeftIcon } from 'lucide-react';

import { URLS } from '@/constants/url.constant';

import { useDocumentation } from './_hook/useDocumentation.hook';

import { CategoryNav } from './_components/CategoryNav';
import { LinkElement } from '@/components/elements/LinkElement';
import { SearchBar } from './_components/SearchBar';

const NavBar = dynamic(() => import('../_components/navigation/NavBar'));

export default function DocumentationLayout({ children }: { children: ReactNode }) {
	const {
		filteredTopics,
		searchQuery,
		setSearchQuery,
		expandedCategory,
		setExpandedCategory,
		isSidebarOpen,
		setIsSidebarOpen,
	} = useDocumentation();

	return (
		<div className="w-full bg-background-dark font-sans text-white">
			<NavBar page="others" />

			<div className="mx-auto mt-[72px] flex h-[calc(100dvh-72px)] max-w-7xl">
				<CategoryNav
					filteredTopics={filteredTopics}
					expandedCategory={expandedCategory}
					setExpandedCategory={setExpandedCategory}
					isSidebarOpen={isSidebarOpen}
					setIsSidebarOpen={setIsSidebarOpen}
				/>

				<div className="flex size-full flex-col">
					<div className="flex items-center justify-between gap-5 p-5">
						<LinkElement
							href={URLS.DASHBOARD}
							title="Go to Dashboard"
							className="flex items-center gap-1.5 text-sm transition-all hover:text-primary"
						>
							<ArrowLeftIcon className="size-4" /> <span className="hidden md:inline">Dashboard</span>
						</LinkElement>

						<SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
					</div>

					<div className="flex size-full flex-col items-center overflow-auto px-4 py-6 sm:px-6 sm:py-10 lg:ml-0 lg:px-8">
						{children}

						<footer className="mt-auto px-4 pt-20 text-center text-xs text-blue-200 opacity-70 sm:text-sm">
							<p>© {new Date().getFullYear()} Amikee Tech Private Ltd. All rights reserved.</p>
						</footer>
					</div>
				</div>
			</div>
		</div>
	);
}
