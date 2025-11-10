import { useEffect } from 'react';
import { LogOutIcon, SlidersHorizontalIcon } from 'lucide-react';

import { NavItem } from '../_types/admin.type';

type AdminSidebarProps = {
	isSidebarOpen: boolean;
	setIsSidebarOpen: (open: boolean) => void;
	navigationItems: NavItem[];
	currentView: string;
	setCurrentView: (view: string) => void;
};

export const AdminSidebar = ({
	isSidebarOpen,
	setIsSidebarOpen,
	navigationItems,
	currentView,
	setCurrentView,
}: AdminSidebarProps) => {
	const handleNavItemClick = (itemName: string) => {
		setCurrentView(itemName);
		if (window.innerWidth < 768) {
			setIsSidebarOpen(false);
		}
	};

	useEffect(() => {
		const handleResize = () => {
			if (window.innerWidth < 768) setIsSidebarOpen(false);
			else setIsSidebarOpen(true);
		};

		handleResize();

		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	}, [setIsSidebarOpen]);

	return (
		<>
			{isSidebarOpen && (
				<div
					className="fixed inset-0 z-40 bg-black bg-opacity-50 md:hidden"
					onClick={() => setIsSidebarOpen(false)}
				/>
			)}

			<aside
				className={`flex h-full flex-col border-r border-gray-700 bg-gray-800 transition-all duration-300 ease-in-out ${isSidebarOpen ? 'fixed z-50 w-64 md:relative md:z-auto' : 'relative w-16 md:w-20'} `}
			>
				<div
					className={`flex h-16 items-center border-b border-gray-700 ${isSidebarOpen ? 'justify-between p-4' : 'justify-center p-4'} `}
				>
					{isSidebarOpen && (
						<span className="text-lg font-semibold text-blue-400 sm:text-xl">Admin Panel</span>
					)}
					<button
						onClick={() => setIsSidebarOpen(!isSidebarOpen)}
						className="rounded-md p-1 text-gray-400 transition-colors duration-200 hover:text-blue-400"
						aria-label={isSidebarOpen ? 'Close sidebar' : 'Open sidebar'}
					>
						<SlidersHorizontalIcon className="h-5 w-5 sm:h-6 sm:w-6" />
					</button>
				</div>

				<nav className="flex-1 space-y-1 overflow-y-auto p-2">
					{navigationItems.map((item) => {
						return (
							<button
								key={item.name}
								onClick={() => handleNavItemClick(item.name)}
								title={item.name}
								className={`flex w-full items-center rounded-md transition-colors duration-150 ${isSidebarOpen ? 'px-3 py-2.5' : 'justify-center px-3 py-3'} ${
									currentView === item.name
										? 'bg-blue-600 text-white shadow-lg'
										: 'text-gray-400 hover:bg-gray-700 hover:text-gray-100'
								} `}
							>
								<item.icon
									className={`${isSidebarOpen ? 'mr-3' : ''} h-4 w-4 shrink-0 sm:h-5 sm:w-5`}
								/>
								{isSidebarOpen && <span className="truncate text-sm font-medium">{item.name}</span>}
							</button>
						);
					})}
				</nav>

				<div className={`border-t border-gray-700 ${isSidebarOpen ? 'p-4' : 'p-2'}`}>
					<button
						title="Logout"
						className={`flex w-full items-center rounded-md transition-colors duration-150 ${isSidebarOpen ? 'px-3 py-2.5' : 'justify-center px-3 py-3'} text-gray-400 hover:bg-red-600 hover:text-gray-100`}
					>
						<LogOutIcon className={`${isSidebarOpen ? 'mr-3' : ''} h-4 w-4 shrink-0 sm:h-5 sm:w-5`} />

						{isSidebarOpen && <span className="text-sm font-medium">Logout</span>}
					</button>
				</div>
			</aside>
		</>
	);
};
