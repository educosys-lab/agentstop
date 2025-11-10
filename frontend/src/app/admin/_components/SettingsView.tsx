import { BellIcon, PaletteIcon, UserCogIcon } from 'lucide-react';

import { ModalType } from '../_types/admin.type';

import { Section } from '../_modules/Section';
import { Button } from '../../../components/ui/button';

type SettingsViewProps = {
	currentRole: string;
	openModal: (title: string, type: ModalType, modalId: string, initialData?: FormData) => void;
};

export const SettingsView = ({ currentRole, openModal }: SettingsViewProps) => {
	return (
		<Section title="Settings">
			<h3 className="mb-2 text-lg font-medium text-slate-400">
				Manage your preferences and application settings.
			</h3>
			<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
				<div className="rounded-lg bg-slate-700 p-4 shadow">
					<h3 className="mb-2 text-lg font-medium text-slate-200">Profile Settings</h3>
					<p className="mb-4 text-sm text-slate-400">Update your admin profile and password.</p>
					<Button
						onClick={() => openModal('Edit Profile', 'editProfile', 'edit-profile-modal')}
						variant="primary"
						size="sm"
					>
						<UserCogIcon className="mr-2 size-5" />
						Edit Profile
					</Button>
				</div>
				<div className="rounded-lg bg-slate-700 p-4 shadow">
					<h3 className="mb-2 text-lg font-medium text-slate-200">Notification Preferences</h3>
					<p className="mb-4 text-sm text-slate-400">Configure how you receive alerts.</p>
					<Button variant="primary" size="sm">
						<BellIcon className="mr-2 size-5" />
						Configure Notifications
					</Button>
				</div>
				{currentRole === 'Super Admin' && (
					<div className="rounded-lg bg-slate-700 p-4 shadow">
						<h3 className="mb-2 text-lg font-medium text-slate-200">Theme Customization</h3>
						<p className="mb-4 text-sm text-slate-400">Customize the admin panel appearance.</p>
						<Button
							onClick={() =>
								openModal(
									'Notification Settings',
									'notificationSettings',
									'notification-settings-modal',
								)
							}
							variant="primary"
							size="sm"
						>
							<PaletteIcon className="mr-2 size-5" />
							Customize Theme
						</Button>
					</div>
				)}
			</div>
		</Section>
	);
};
