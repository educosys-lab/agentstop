import { ChevronDown, X, Menu } from 'lucide-react';

import { cn } from '@/utils/theme.util';

import { Button } from '@/components/ui/button';
import { Dispatch, SetStateAction } from 'react';

type CategoryNavProps = {
	categories: { [category: string]: string[] };
	selectedCategory: string;
	setSelectedCategory: (category: string) => void;
	selectedSubCategory: string;
	setSelectedSubCategory: (subCategory: string) => void;
	expandedCategory: string[];
	setExpandedCategory: Dispatch<SetStateAction<string[]>>;
	isSidebarOpen: boolean;
	setIsSidebarOpen: (isOpen: boolean) => void;
};

export const CategoryNav = ({
	categories,
	selectedCategory,
	setSelectedCategory,
	selectedSubCategory,
	setSelectedSubCategory,
	expandedCategory,
	setExpandedCategory,
	isSidebarOpen,
	setIsSidebarOpen,
}: CategoryNavProps) => {
	return (
		<>
			<Button
				onClick={() => setIsSidebarOpen(true)}
				className="fixed left-4 top-24 z-50 rounded-lg bg-gray-800 p-2 text-white shadow-lg hover:bg-gray-700 lg:hidden"
				variant="wrapper"
			>
				<Menu size={20} />
			</Button>

			{isSidebarOpen && (
				<div
					className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
					onClick={() => setIsSidebarOpen(false)}
				/>
			)}

			<aside
				className={cn(
					'fixed inset-y-0 left-0 z-50 w-72 shrink-0 overflow-y-auto border-r border-indigo-700 p-4 pt-6 transition-transform duration-300 ease-in-out sm:p-6 sm:pt-10 lg:static',
					'lg:transform-none lg:transition-none',
					isSidebarOpen ? 'translate-x-0 transform bg-gray-800' : '-translate-x-full transform lg:translate-x-0',
				)}
			>
				<Button
					onClick={() => setIsSidebarOpen(false)}
					className="absolute right-4 top-4 rounded bg-gray-700 p-1 text-white hover:bg-gray-600 lg:hidden"
					variant="wrapper"
				>
					<X size={16} />
				</Button>

				<nav className="mt-8 lg:mt-0">
					<h2 className="gradient-primary mb-4 bg-clip-text text-lg font-bold text-transparent sm:mb-6 sm:text-xl">
						Categories
					</h2>
					<ul className="space-y-1 sm:space-y-2">
						{Object.entries(categories).map(([category, subCategories]) => (
							<li key={category}>
								<Button
									onClick={() => {
										if (selectedCategory === category) {
											setSelectedCategory('');
											setSelectedSubCategory('');
											setExpandedCategory([]);
										} else {
											setSelectedCategory(category);
											setSelectedSubCategory('');
											setExpandedCategory([category]);
										}
										if (window.innerWidth < 1024) {
											setIsSidebarOpen(false);
										}
									}}
									variant="wrapper"
									className={cn(
										'flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm text-blue-200 transition-colors duration-200 hover:bg-blue-700 hover:bg-opacity-50 sm:text-base',
										selectedCategory === category
											? 'bg-gradient-to-r from-purple-700 to-blue-700 font-semibold text-white hover:bg-blue-800 hover:bg-opacity-50'
											: '',
									)}
								>
									<span className="truncate">{category}</span>
									{subCategories.length > 0 && (
										<ChevronDown
											size={16}
											className={cn(
												'ml-2 shrink-0 transform transition-transform',
												expandedCategory.includes(category) ? 'rotate-180' : '',
											)}
										/>
									)}
								</Button>
								{subCategories.length > 0 && expandedCategory.includes(category) && (
									<ul className="mt-2 space-y-1 pl-4 sm:pl-6">
										{subCategories.map((subCat) => (
											<li key={subCat}>
												<Button
													onClick={() => {
														setSelectedCategory(category);
														setSelectedSubCategory(subCat);

														if (window.innerWidth < 1024) {
															setIsSidebarOpen(false);
														}
													}}
													variant="wrapper"
													className={cn(
														'block w-full rounded-lg px-3 py-1.5 text-left text-xs text-blue-300 transition-colors duration-200 hover:bg-blue-700 hover:bg-opacity-50 sm:text-sm',
														selectedSubCategory === subCat && selectedCategory === category
															? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:bg-blue-700 hover:bg-opacity-50'
															: '',
													)}
												>
													<span className="truncate">{subCat}</span>
												</Button>
											</li>
										))}
									</ul>
								)}
							</li>
						))}
					</ul>
				</nav>
			</aside>
		</>
	);
};
