'use client';

import dynamic from 'next/dynamic';
import { ArrowLeftIcon } from 'lucide-react';

import { URLS } from '@/constants/url.constant';

import { useTemplate } from './_hook/useTemplate.hook';

import { CategoryNav } from './_components/CategoryNav';
import { SearchBar } from './_components/SearchBar';
import { TemplateGrid } from './_components/TemplateGrid';
import { LinkElement } from '@/components/elements/LinkElement';
import { useTemplateCustom } from './_hook/useTemplateCustom.hook';

const NavBar = dynamic(() => import('../_components/navigation/NavBar'), { ssr: false });

export default function TemplatePage() {
	const {
		searchQuery,
		setSearchQuery,
		allCategories,
		selectedCategory,
		setSelectedCategory,
		selectedSubCategory,
		setSelectedSubCategory,
		expandedCategory,
		setExpandedCategory,
		filteredTemplates,
		isSidebarOpen,
		setIsSidebarOpen,
	} = useTemplate();

	// Just calling this hook to trigger the useEffect
	useTemplateCustom();

	return (
		<div className="w-full bg-background-dark font-sans text-white">
			<NavBar page={'others'} />

			<div className="mx-auto mt-[72px] flex min-h-dvh w-full">
				<CategoryNav
					categories={allCategories}
					selectedCategory={selectedCategory}
					setSelectedCategory={setSelectedCategory}
					selectedSubCategory={selectedSubCategory}
					setSelectedSubCategory={setSelectedSubCategory}
					expandedCategory={expandedCategory}
					setExpandedCategory={setExpandedCategory}
					isSidebarOpen={isSidebarOpen}
					setIsSidebarOpen={setIsSidebarOpen}
				/>

				<div className="flex flex-col">
					<LinkElement
						href={URLS.DASHBOARD}
						title="Go to Dashboard"
						className="ml-5 mt-5 flex items-center gap-1.5 text-sm transition-all hover:text-primary"
					>
						<ArrowLeftIcon className="size-4" /> <span className="hidden md:inline">Dashboard</span>
					</LinkElement>

					<div className="flex grow flex-col items-center px-4 py-6 sm:px-6 sm:py-10 lg:ml-0 lg:px-8">
						{/* <header className="mb-8 mt-12 w-full max-w-4xl text-center sm:mb-12 lg:mt-0">
							<h1 className="mb-3 text-3xl font-extrabold leading-tight text-blue-100 sm:mb-4 sm:text-4xl md:text-5xl lg:text-6xl">
								Agentstop
							</h1>
							<p className="px-4 text-base text-blue-200 opacity-90 sm:px-0 sm:text-lg md:text-xl">
								Discover powerful pre-built missions to automate your tasks and boost productivity
								across various industries.
							</p>
						</header> */}

						<SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
						<TemplateGrid templates={filteredTemplates} />

						<footer className="mt-auto px-4 text-center text-xs text-blue-200 opacity-70 sm:text-sm">
							<p>© {new Date().getFullYear()} Amikee Tech Private Ltd. All rights reserved.</p>
						</footer>
					</div>
				</div>
			</div>
		</div>
	);
}
