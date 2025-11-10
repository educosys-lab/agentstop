import { Dispatch, SetStateAction } from 'react';
import { ChevronDown, X, Menu } from 'lucide-react';
import { usePathname } from 'next/navigation';

import { cn } from '@/utils/theme.util';
import { topics } from '../_data/nav.data';

import { LinkElement } from '@/components/elements/LinkElement';
import { ButtonElement } from '@/components/elements/ButtonElement';

type CategoryNavProps = {
	filteredTopics: string[];
	expandedCategory: string[];
	setExpandedCategory: Dispatch<SetStateAction<string[]>>;
	isSidebarOpen: boolean;
	setIsSidebarOpen: (isOpen: boolean) => void;
};

export const CategoryNav = ({
	filteredTopics,
	expandedCategory,
	setExpandedCategory,
	isSidebarOpen,
	setIsSidebarOpen,
}: CategoryNavProps) => {
	const pathname = usePathname();
	const pathnameParts = pathname.split('/').filter((part) => part);

	const activeTopic = pathnameParts.length >= 2 ? pathnameParts[1] : null;
	const activeSubTopic = pathnameParts.length >= 3 ? pathnameParts[2] : null;

	return (
		<>
			<ButtonElement
				onClick={() => setIsSidebarOpen(true)}
				title="Open Menu"
				className="fixed left-4 top-4 z-50 rounded-lg bg-gray-800 p-2 text-white shadow-lg hover:bg-gray-700 lg:hidden"
				variant="wrapper"
			>
				<Menu size={20} />
			</ButtonElement>

			{isSidebarOpen && (
				<div
					className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
					onClick={() => setIsSidebarOpen(false)}
				/>
			)}

			<aside
				className={cn(
					'fixed inset-y-0 left-0 z-50 w-64 shrink-0 overflow-y-auto border-r border-indigo-700 p-4 pt-6 transition-transform duration-300 ease-in-out sm:p-6 sm:pt-10 lg:static',
					'lg:transform-none lg:transition-none',
					isSidebarOpen ? 'translate-x-0 transform' : '-translate-x-full transform lg:translate-x-0',
				)}
			>
				<ButtonElement
					onClick={() => setIsSidebarOpen(false)}
					title="Close"
					className="absolute right-4 top-4 rounded bg-gray-700 p-1 text-white hover:bg-gray-600 lg:hidden"
					variant="wrapper"
				>
					<X size={16} />
				</ButtonElement>

				<nav className="mt-8 lg:mt-0">
					<h2 className="gradient-primary mb-4 bg-clip-text text-lg font-bold text-transparent sm:mb-6 sm:text-xl">
						Topics
					</h2>
					<ul className="space-y-1 sm:space-y-2">
						{topics.map((data, rootIndex) => (
							<li key={rootIndex}>
								<LinkElement
									href={data.link}
									onClick={() => {
										setExpandedCategory((prev) => [...prev, data.topic]);
										if (window.innerWidth < 1024) setIsSidebarOpen(false);
									}}
									title={data.topic}
									variant="wrapper"
									className={cn(
										'flex items-center justify-between text-left text-sm text-blue-200 transition-colors duration-200 sm:text-base',
										activeTopic === data.link.split('/').pop() && 'font-medium text-success',
									)}
								>
									<span
										className={cn(
											'truncate px-1 py-0.5 hover:text-primary',
											filteredTopics.includes(data.link) &&
												'rounded-sm bg-primary text-primary-foreground',
										)}
									>
										{data.topic}
									</span>

									{data.subTopics.length > 0 && (
										<ButtonElement
											onClick={(event) => {
												event.preventDefault();
												event.stopPropagation();

												setExpandedCategory((prev) => {
													if (prev.includes(data.topic)) {
														return prev.filter((value) => value !== data.topic);
													}
													return [...prev, data.topic];
												});
											}}
											title="Close"
											className="ml-2 rounded-full hover:bg-muted-dark"
											variant="wrapper"
										>
											<ChevronDown
												size={16}
												className={cn(
													'shrink-0 transform transition-transform',
													expandedCategory.includes(data.topic) ? 'rotate-180' : '',
												)}
											/>
										</ButtonElement>
									)}
								</LinkElement>

								{data.subTopics.length > 0 && expandedCategory.includes(data.topic) && (
									<ul className="mt-3 space-y-3">
										{data.subTopics.map((subTopic, index) => (
											<li key={`${rootIndex}-${index}`}>
												<LinkElement
													href={subTopic.link}
													onClick={(event) => {
														event.stopPropagation();
														if (window.innerWidth < 1024) setIsSidebarOpen(false);
													}}
													title={subTopic.title}
													variant="wrapper"
													className={cn(
														'ml-4 block w-full rounded-lg text-left text-xs text-blue-300 transition-colors duration-200 hover:text-primary sm:text-sm',
														activeSubTopic === subTopic.link.split('/').pop() &&
															'font-medium text-success',
													)}
												>
													<span
														className={cn(
															'w-max px-1 py-0.5',
															filteredTopics.includes(subTopic.link) &&
																'rounded-sm bg-primary text-primary-foreground',
														)}
													>
														{subTopic.title}
													</span>
												</LinkElement>
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
