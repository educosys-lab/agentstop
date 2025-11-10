import { Background, Controls, ReactFlow } from '@xyflow/react';
import { LaptopIcon, TriangleAlertIcon } from 'lucide-react';

import '@xyflow/react/dist/style.css';
import './styles/react-flow.css';

import { workflowEdges } from './types/edge.type';

import { useWorkflowEditor } from './hooks/useWorkflowEditor.hook';
import { workflowStore } from '../../_store/workflow.store';
import { useReactFlowCustom } from './hooks/useReactFlowCustom.hook';
import { useWorkflowEvents } from './hooks/useWorkflowEvents.hook';
import { useAppSelector } from '@/store/hook/redux.hook';

import FloatingConnectionLine from './modules/edge/FloatingConnectionLine';
import NodeSidebar from './modules/search-nodes/NodeSidebar';
import EditorTopbar from './modules/editor-topbar/EditorTopbar';
import CenterNodeList from './modules/search-nodes/CenterNodeList';
import NodeConfig from './modules/node-config/NodeConfig';
import TemplateDetailsModal from './modules/editor-topbar/TemplateDetailsModal';
// import WorkflowSettings from './modules/workflow-settings/WorkflowSettings';
// import Settings from './modules/workflow-settings/Settings';

export default function WorkflowEditor() {
	const workflow = useAppSelector((state) => state.workflowState.workflow);
	const { onConnect, isValidConnection, isLive, hasResponder } = useWorkflowEditor();
	const { nodes, edges, modifiedOnNodesChange, modifiedOnEdgesChange, workflowEditorRef, workflowNodes } =
		useReactFlowCustom();
	const { handleKeyboardEvent } = useWorkflowEvents();

	const isEditingText = workflowStore((state) => state.isEditingText);

	if (!workflow || !workflowNodes) return null;
	return (
		<div className="flex size-full flex-col bg-gray-800/50">
			<EditorTopbar />
			<TemplateDetailsModal />

			<div tabIndex={isLive ? -1 : 0} className="flex h-[calc(100vh-80px)] w-full">
				<NodeSidebar />

				<div className="relative size-full">
					<CenterNodeList />

					<div ref={workflowEditorRef} className="size-full">
						<ReactFlow
							nodes={nodes}
							edges={edges}
							onNodesChange={modifiedOnNodesChange}
							onEdgesChange={modifiedOnEdgesChange}
							onConnect={onConnect}
							connectionLineComponent={FloatingConnectionLine}
							isValidConnection={isValidConnection}
							tabIndex={isLive ? -1 : 0}
							onKeyDown={handleKeyboardEvent}
							nodesDraggable={!isLive}
							nodesConnectable={!isLive}
							elementsSelectable={!isLive}
							nodeTypes={workflowNodes}
							edgeTypes={workflowEdges}
							minZoom={0.1}
							fitView={true}
							zoomOnScroll={!isEditingText}
							onPaneContextMenu={(event) => event.preventDefault()}
						>
							<Controls position="bottom-right" />

							<div className="absolute bottom-4 left-1/2 flex w-2/3 -translate-x-1/2 flex-col items-center gap-1.5 text-muted sm:flex-row sm:justify-center sm:text-center md:hidden">
								<LaptopIcon className="hidden size-4 sm:flex" />
								<span className="mt-1 sm:mt-0">Best experience on laptop screen</span>
							</div>

							<Background />
						</ReactFlow>
					</div>

					{/* <WorkflowSettings /> */}

					{isLive && (
						<div className="absolute inset-[15px_0_auto_0] mx-auto flex max-w-md flex-col gap-2.5 px-2">
							<div className="flex items-center gap-3 rounded-lg bg-primary-dark/25 px-4 py-3">
								<TriangleAlertIcon className="size-6 shrink-0 text-primary" />
								<div>
									<h5>Live Mode</h5>
									<p>Live Mission can not be edited!</p>
								</div>
							</div>

							{!hasResponder && (
								<div className="flex items-center gap-3 rounded-lg bg-warn-dark/25 px-4 py-3">
									<TriangleAlertIcon className="size-6 shrink-0 text-warn" />
									<div>
										<h5>No Responder Connected</h5>
										<p>You will not receive responses!</p>
									</div>
								</div>
							)}
						</div>
					)}
				</div>

				<NodeConfig />

				{/* <Settings /> */}
			</div>
		</div>
	);
}
