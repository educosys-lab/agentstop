'use client';

import { useAdmin } from './_hooks/useAdmin.hook';

import { Button } from '../../components/ui/button';
import { ModalElement } from '@/components/elements/ModalElement';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../components/ui/select';
import { DashboardView } from './_components/DashboardView';
import { MetricsView } from './_components/MetricsView';
import { UserManagementView } from './_components/UserManagementView';
import { WorkflowManagementView } from './_components/WorkflowManagementView';
import { AnnouncementsView } from './_components/AnnouncementsView';
import { InfrastructureView } from './_components/InfrastructureView';
import { PaymentGatewaysView } from './_components/PaymentGatewaysView';
import { RoleManagementView } from './_components/RoleManagementView';
import { DataExportView } from './_components/DataExportView';
import { SecurityAuditsView } from './_components/SecurityAuditsView';
import { UserSegmentsView } from './_components/UserSegmentsView';
import { SettingsView } from './_components/SettingsView';
import { AdminTopBar } from './_components/AdminTopBar';
import { AdminSidebar } from './_components/AdminSidebar';
import { ChangeEvent } from 'react';

export default function AdminPage() {
	const {
		currentRole,
		setCurrentRole,
		currentView,
		setCurrentView,
		isSidebarOpen,
		setIsSidebarOpen,
		modalContent,
		formData,
		metrics,
		users,
		workflows,
		announcements,
		adminRoles,
		navigationItems,
		handleFormChange,
		onOpenModal,
		onCloseModal,
		handleModalSubmit,
		commonActions,
	} = useAdmin();

	const viewComponents: Record<string, JSX.Element> = {
		Dashboard: (
			<DashboardView
				currentRole={currentRole}
				metrics={metrics}
				openModal={onOpenModal}
				setCurrentView={setCurrentView}
			/>
		),
		'Metrics & Analytics': (
			<MetricsView
				currentView={currentView}
				commonActions={commonActions}
				openModal={onOpenModal}
				currentRole={currentRole}
			/>
		),
		'Infrastructure Metrics': (
			<MetricsView
				currentView={currentView}
				commonActions={commonActions}
				openModal={onOpenModal}
				currentRole={currentRole}
			/>
		),
		'User Growth Metrics': (
			<MetricsView
				currentView={currentView}
				commonActions={commonActions}
				openModal={onOpenModal}
				currentRole={currentRole}
			/>
		),
		'Business Metrics': (
			<MetricsView
				currentView={currentView}
				commonActions={commonActions}
				openModal={onOpenModal}
				currentRole={currentRole}
			/>
		),
		'User Management': <UserManagementView users={users} commonActions={commonActions} openModal={onOpenModal} />,
		'Workflow Management': (
			<WorkflowManagementView workflows={workflows} commonActions={commonActions} openModal={onOpenModal} />
		),
		Announcements: (
			<AnnouncementsView
				announcements={announcements}
				commonActions={commonActions}
				openModal={onOpenModal}
				currentView={currentView}
			/>
		),
		Campaigns: (
			<AnnouncementsView
				announcements={announcements}
				commonActions={commonActions}
				openModal={onOpenModal}
				currentView={currentView}
			/>
		),
		Infrastructure: (
			<InfrastructureView currentView={currentView} commonActions={commonActions} openModal={onOpenModal} />
		),
		'Infrastructure Status': (
			<InfrastructureView currentView={currentView} commonActions={commonActions} openModal={onOpenModal} />
		),
		'Payment Gateways': <PaymentGatewaysView commonActions={commonActions} openModal={onOpenModal} />,
		'Role Management': (
			<RoleManagementView adminRoles={adminRoles} commonActions={commonActions} openModal={onOpenModal} />
		),
		'Data Export': <DataExportView currentRole={currentRole} commonActions={commonActions} />,
		'Data Export (Logs)': <DataExportView currentRole={currentRole} commonActions={commonActions} />,
		'Data Export (Users)': <DataExportView currentRole={currentRole} commonActions={commonActions} />,
		'Security Audits': <SecurityAuditsView commonActions={commonActions} openModal={onOpenModal} />,
		'User Segments': <UserSegmentsView commonActions={commonActions} openModal={onOpenModal} />,
		Settings: <SettingsView currentRole={currentRole} openModal={onOpenModal} />,
	};

	const renderModalForm = () => {
		switch (modalContent.type) {
			case 'banUser':
				return (
					<>
						<p className="mb-4 text-slate-300">
							Are you sure you want to ban user {formData.name || 'this user'} ({formData.email || 'N/A'}
							)?
						</p>
						<Input
							name="banReason"
							value={formData.banReason || ''}
							onChange={handleFormChange}
							placeholder="e.g., Violation of ToS"
							className="my-2"
						/>
						<div className="mt-6 flex justify-end space-x-3">
							<Button variant="outline" onClick={onCloseModal}>
								Cancel
							</Button>
							<Button variant="destructive" onClick={handleModalSubmit}>
								Confirm Ban
							</Button>
						</div>
					</>
				);
			case 'refundPayment':
				return (
					<>
						<Input
							name="userId"
							value={formData.userId || ''}
							onChange={handleFormChange}
							placeholder="user@example.com or usr_123"
							className="my-2"
						/>
						<Input
							name="transactionId"
							value={formData.transactionId || ''}
							onChange={handleFormChange}
							placeholder="txn_abc123"
							className="my-2"
						/>
						<Input
							name="amount"
							type="number"
							value={formData.amount || ''}
							onChange={handleFormChange}
							placeholder="50.00"
							className="my-2"
						/>
						<Textarea
							name="refundReason"
							value={formData.refundReason || ''}
							onChange={handleFormChange}
							placeholder="e.g., Accidental charge"
						/>
						<div className="mt-6 flex justify-end space-x-3">
							<Button variant="outline" onClick={onCloseModal}>
								Cancel
							</Button>
							<Button variant="primary" onClick={handleModalSubmit}>
								Process Refund
							</Button>
						</div>
					</>
				);
			case 'extendTrial':
			case 'extendTrialMarketing':
				return (
					<>
						<Input
							name="userId"
							value={formData.userId || ''}
							onChange={handleFormChange}
							placeholder="user@example.com or usr_123"
							className="my-2"
						/>
						<Input
							name="days"
							type="number"
							value={formData.days || ''}
							onChange={handleFormChange}
							placeholder="7"
							className="my-2"
						/>
						<div className="mt-6 flex justify-end space-x-3">
							<Button variant="outline" onClick={onCloseModal}>
								Cancel
							</Button>
							<Button variant="primary" onClick={handleModalSubmit}>
								Extend Trial
							</Button>
						</div>
					</>
				);
			case 'applyDiscount':
				return (
					<>
						<Input
							name="targetGroup"
							value={formData.targetGroup || ''}
							onChange={handleFormChange}
							placeholder="e.g., 'Free Tier Users' or user@example.com"
							className="my-2"
						/>
						<Input
							name="discountCode"
							value={formData.discountCode || ''}
							onChange={handleFormChange}
							placeholder="SUMMER25"
							className="my-2"
						/>
						<Input
							name="percentage"
							type="number"
							value={formData.percentage || ''}
							onChange={handleFormChange}
							placeholder="25"
							className="my-2"
						/>
						<div className="mt-6 flex justify-end space-x-3">
							<Button variant="outline" onClick={onCloseModal}>
								Cancel
							</Button>
							<Button variant="primary" onClick={handleModalSubmit}>
								Apply Discount
							</Button>
						</div>
					</>
				);
			case 'createAnnouncement':
			case 'editAnnouncement':
				return (
					<>
						<Input name="title" value={formData.title || ''} onChange={handleFormChange} className="my-2" />
						<Select
							name="type"
							value={formData.type || 'In-App'}
							onValueChange={(value) =>
								handleFormChange({
									target: { name: 'type', value },
								} as ChangeEvent<HTMLSelectElement>)
							}
						>
							<SelectTrigger>
								<SelectValue placeholder="Select type" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="In-App">In-App Notification</SelectItem>
								<SelectItem value="Email">Email Campaign</SelectItem>
								<SelectItem value="Email & In-App">Email & In-App</SelectItem>
							</SelectContent>
						</Select>
						<Textarea
							name="content"
							value={formData.content || ''}
							onChange={handleFormChange}
							placeholder="Edit Announcement"
							className="my-2"
						/>
						<Input
							name="audience"
							value={formData.audience || 'All Users'}
							onChange={handleFormChange}
							placeholder="e.g., All Users, Pro Tier, Specific Segment"
							className="my-2"
						/>
						<div className="mt-6 flex justify-end space-x-3">
							<Button variant="outline" onClick={onCloseModal}>
								Cancel
							</Button>
							<Button variant="primary" onClick={handleModalSubmit}>
								{modalContent.type === 'createAnnouncement' ? 'Create' : 'Save Changes'}
							</Button>
						</div>
					</>
				);
			default:
				return <p className="text-slate-400">No form defined for this action.</p>;
		}
	};

	return (
		<div className="flex h-screen bg-gray-900 text-gray-200">
			<AdminSidebar
				isSidebarOpen={isSidebarOpen}
				setIsSidebarOpen={setIsSidebarOpen}
				navigationItems={navigationItems}
				currentView={currentView}
				setCurrentView={setCurrentView}
			/>

			<div className="flex min-w-0 flex-1 flex-col">
				<AdminTopBar
					currentRole={currentRole}
					setCurrentRole={setCurrentRole}
					currentView={currentView}
					onUserSettingsClick={function (): void {
						throw new Error('Function not implemented.');
					}}
				/>

				<main className="flex-1 overflow-y-auto overflow-x-hidden bg-gray-900 p-3 sm:p-4 md:p-6">
					{viewComponents[currentView] || (
						<div className="py-10 text-center text-gray-500">Select a view from the sidebar.</div>
					)}
				</main>
			</div>

			<ModalElement
				modalId={modalContent.modalId || 'admin-modal'}
				modalWidth={modalContent.modalWidth || 'md'}
				modalTitle={modalContent.title || 'Action'}
				modalDescription={'Manage settings'}
			>
				<div>{renderModalForm()}</div>
			</ModalElement>
		</div>
	);
}
