import { BellIcon, UserCogIcon, ChevronDownIcon } from 'lucide-react';

import { rolesConfigData } from '../_data/admin.data';

type AdminTopBarProps = {
	currentRole: string;
	setCurrentRole: (role: string) => void;
	currentView: string;
	onUserSettingsClick: () => void;
};

export const AdminTopBar = ({ currentRole, setCurrentRole, currentView, onUserSettingsClick }: AdminTopBarProps) => {
	const RoleIcon = rolesConfigData[currentRole].icon;

	return (
		<header className="flex h-16 items-center justify-between border-b border-gray-600 bg-gradient-to-r from-gray-800 to-gray-700 px-3 shadow-lg sm:px-4 md:px-6">
			<div className="flex min-w-0 flex-1 items-center space-x-2 sm:space-x-3">
				<RoleIcon className="h-5 w-5 shrink-0 animate-pulse text-blue-400 sm:h-6 sm:w-6" />
				<div className="flex min-w-0 items-center space-x-1 sm:space-x-2">
					<span className="truncate text-sm font-semibold tracking-wide text-gray-100 sm:text-lg">
						{currentRole}
					</span>
					<span className="xs:inline hidden font-medium text-gray-400">/</span>
					<span className="xs:inline hidden truncate text-sm font-medium text-gray-300 sm:text-lg">
						{currentView}
					</span>
				</div>
			</div>

			<div className="flex shrink-0 items-center space-x-2 sm:space-x-3 md:space-x-5">
				<div className="group relative">
					<select
						value={currentRole}
						onChange={(e) => setCurrentRole(e.target.value)}
						className="max-w-[120px] appearance-none rounded-lg border border-gray-500 bg-gray-700 py-1.5 pl-2 pr-6 text-xs text-gray-100 transition-all duration-200 hover:bg-gray-600 focus:border-blue-500 focus:ring-blue-500 sm:max-w-none sm:py-2 sm:pl-3 sm:pr-10 sm:text-sm"
					>
						{Object.keys(rolesConfigData).map((role) => (
							<option key={role} value={role}>
								{role}
							</option>
						))}
					</select>

					<ChevronDownIcon className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-gray-400 transition-colors group-hover:text-blue-400 sm:right-3 sm:h-4 sm:w-4" />
				</div>

				<button
					className="relative p-1 text-gray-300 transition-colors duration-200 hover:text-blue-400"
					aria-label="Notifications"
				>
					<BellIcon className="h-5 w-5 sm:h-6 sm:w-6" />
					<span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full border-2 border-gray-700 bg-red-500 text-xs font-bold text-white sm:h-5 sm:w-5">
						3
					</span>
				</button>

				<button
					className="p-1 text-gray-300 transition-colors duration-200 hover:text-blue-400"
					onClick={onUserSettingsClick}
					aria-label="User Settings"
				>
					<UserCogIcon className="h-5 w-5 sm:h-6 sm:w-6" />
				</button>
			</div>
		</header>
	);
};
