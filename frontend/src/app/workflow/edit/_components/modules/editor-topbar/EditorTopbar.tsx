import { ArrowLeftIcon, MenuIcon, MessageSquareMoreIcon, PencilLineIcon, RefreshCwIcon } from 'lucide-react';

import { URLS } from '@/constants/url.constant';

import { useAppSelector } from '@/store/hook/redux.hook';
import { workflowStore } from '@/app/workflow/_store/workflow.store';
import { useWorkflowEditor } from '../../hooks/useWorkflowEditor.hook';
import { useEditorTopbar } from './hooks/useEditorTopbar.hook';

// import { ButtonElement } from '@/components/elements/ButtonElement';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { LinkElement } from '@/components/elements/LinkElement';
import { ButtonElement } from '@/components/elements/ButtonElement';
// import { Toggle } from '@/components/ui/toggle';
// import { workflowStoreSynced } from '@/app/workflow/_store/workflow-synced.store';

export default function EditorTopbar() {
	const user = useAppSelector((state) => state.userState.user);
	const workflow = useAppSelector((state) => state.workflowState.workflow);

	const {
		workflowTitle,
		setWorkflowTitle,
		showAllResponses,
		onToggleWorkflowStatus,
		onToggleResponseSettings,
		// onToggleSettingsSidebar,
		onTitleUpdate,
		// onTestNode,
		onGoToDashboard,
		isDropdownOpen,
		toggleDropdown,
		dropdownRef,
		onClickAddTemplate,
	} = useEditorTopbar();
	const workflowSyncStatus = workflowStore((state) => state.workflowSyncStatus);
	// const isSettingsSidebarOpen = workflowStoreSynced((state) => state.isSettingsSidebarOpen);
	const {
		// selectedNodeType,
		isLive,
	} = useWorkflowEditor();

	const showInteractButton = workflow?.nodes.some((node) => node.type === 'interact-trigger');

	if (!workflow) return null;
	return (
		<div className="flex h-18 items-center bg-black/25 p-3">
			<div className="flex items-center space-x-4 md:space-x-5">
				<LinkElement
					href={URLS.DASHBOARD}
					onClick={onGoToDashboard}
					title="Go to Dashboard"
					className="flex items-center gap-1.5 text-sm transition-all hover:text-primary"
				>
					<ArrowLeftIcon className="size-4" /> <span className="hidden md:inline">Dashboard</span>
				</LinkElement>

				<span className="mx-5 h-8 w-0.5 rounded-full bg-muted-dark" />

				<div className="flex items-center gap-2">
					<PencilLineIcon className="size-5" />
					<input
						value={workflowTitle}
						onChange={(event) => setWorkflowTitle(event.target.value)}
						onBlur={() => onTitleUpdate()}
						onKeyDown={(event) => {
							if (event.key === 'Enter') event.currentTarget.blur();
						}}
						disabled={isLive}
						className="w-40 bg-transparent placeholder-muted-dark outline-none lg:w-52"
					/>
				</div>
			</div>

			<div className="ml-auto hidden items-center space-x-4 md:flex">
				{user?.isAdmin && (
					<>
						<ButtonElement
							onClick={onClickAddTemplate}
							title="Add template"
							variant={'outline'}
							size={'sm'}
						>
							Add Template
						</ButtonElement>
						<span className="mx-5 h-8 w-0.5 rounded-full bg-muted-dark" />
					</>
				)}

				<div className="flex items-center space-x-2">
					<Switch
						checked={isLive ? true : false}
						onCheckedChange={onToggleWorkflowStatus}
						id="workflow-status"
					/>
					<Label htmlFor="workflow-status">{isLive ? 'Live' : 'Offline'}</Label>
				</div>

				{showInteractButton && (
					<>
						<span className="mx-5 h-8 w-0.5 rounded-full bg-muted-dark" />
						<LinkElement
							href={`${URLS.CHAT}?workflowId=${workflow.id}`}
							target="_blank"
							rel="noopener noreferrer"
							title="Go to Interact"
							className="rounded-md transition-all hover:bg-transparent hover:text-primary"
						>
							<MessageSquareMoreIcon className="size-6" />
						</LinkElement>
					</>
				)}

				{/* {process.env.NEXT_PUBLIC_ENV !== 'production' && selectedNodeType && (
				<>
					<span className="mx-5 h-8 w-0.5 rounded-full bg-muted-dark" />
					<ButtonElement onClick={onTestNode} title="Test node" size={'sm'}>
						Test Node
					</ButtonElement>
				</>
			)} */}

				<span className="mx-5 h-8 w-0.5 rounded-full bg-muted-dark" />

				<div className="flex items-center space-x-2">
					<Switch
						checked={showAllResponses ? true : false}
						onCheckedChange={onToggleResponseSettings}
						id="response-settings"
						disabled={isLive}
					/>
					<Label htmlFor="response-settings">Trace</Label>
				</div>

				{/* <Toggle
				pressed={isSettingsSidebarOpen}
				onPressedChange={onToggleSettingsSidebar}
				disabled={isLive}
				variant={'outline'}
				className="size-9 min-w-0 p-2"
			>
				<SettingsIcon className="!size-5" />
			</Toggle> */}

				<span className="mx-5 h-8 w-0.5 rounded-full bg-muted-dark" />

				<p className="flex w-32 items-center gap-1.5 text-muted">
					<RefreshCwIcon className="size-5" /> {workflowSyncStatus}
				</p>
			</div>

			<div className="ml-auto flex items-center md:hidden">
				<button onClick={toggleDropdown} className="p-2">
					<MenuIcon className="size-6 text-muted" />
				</button>
				{isDropdownOpen && (
					<div
						ref={dropdownRef}
						className="absolute right-3 top-16 z-50 w-48 rounded-md border border-muted-dark bg-black p-2 shadow-lg"
					>
						<div className="flex items-center justify-between p-2">
							<Label htmlFor="workflow-status">{isLive ? 'Live' : 'Offline'}</Label>
							<Switch
								checked={isLive ? true : false}
								onCheckedChange={onToggleWorkflowStatus}
								id="workflow-status"
							/>
						</div>
						{showInteractButton && (
							<LinkElement
								href={`${URLS.CHAT}?workflowId=${workflow.id}`}
								title="Go to Interact"
								className="flex w-full items-center gap-2 rounded-md p-2 transition-all hover:bg-gray-700"
							>
								<MessageSquareMoreIcon className="size-5" /> Interact
							</LinkElement>
						)}
						<div className="flex items-center justify-between p-2">
							<Label htmlFor="response-settings">Trace</Label>
							<Switch
								checked={showAllResponses ? true : false}
								onCheckedChange={onToggleResponseSettings}
								id="response-settings"
								disabled={isLive}
							/>
						</div>
						<div className="flex items-center gap-2 p-2 text-muted">
							<RefreshCwIcon className="size-5" /> {workflowSyncStatus}
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
