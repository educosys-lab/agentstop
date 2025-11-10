import { ReactNode } from 'react';
import { useNodeId, useNodes, useReactFlow } from '@xyflow/react';

import { cn } from '@/utils/theme.util';
import { TextNodeVariant } from '../../types/nodes/text-node.type';
import { ReactFlowNode } from '../../types/workflow-editor.type';

import { useWorkflowNodeContextMenu } from './hooks/useWorkflowNodeContextMenu.hook';
import { workflowStore } from '@/app/workflow/_store/workflow.store';

import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from '@/components/ui/context-menu';
import { TextAreaElement } from '@/components/elements/TextAreaElement';
import ConnectHandles from '../edge/ConnectHandles';

type NodeContainerProps = {
	children: ReactNode;
};

export default function NodeContainer({ children }: NodeContainerProps) {
	const nodes = useNodes() as ReactFlowNode[];
	const { setNodes } = useReactFlow();
	const { workflowNodeMenuItems } = useWorkflowNodeContextMenu();

	const isEditingText = workflowStore((state) => state.isEditingText);
	const isConfigBarOpen = workflowStore((state) => state.isConfigBarOpen);
	const setWSValue = workflowStore((state) => state.setWSValue);

	const nodeId = useNodeId();

	const thisNode = nodes.find((node) => node.id === nodeId);
	const isTextNode = thisNode ? Object.values(TextNodeVariant).includes(thisNode.type as any) : false;
	const isGroup = thisNode?.type === 'group';

	const updateNodeText = (text: string) => {
		const updatedNodes = JSON.parse(JSON.stringify(nodes)) as ReactFlowNode[];
		const thisNodeIndex = updatedNodes.findIndex((node) => node.id === nodeId);
		updatedNodes[thisNodeIndex].data.inputValue = text;
		setNodes(updatedNodes);
	};

	if (!thisNode) return null;
	return (
		<>
			<ContextMenu>
				<ContextMenuTrigger
					onDoubleClick={() => setWSValue({ isConfigBarOpen: !isConfigBarOpen })}
					className="block size-max"
				>
					<div className={cn('elementContainer relative size-14', isEditingText && 'nodrag')}>
						<div
							className={cn(
								'absolute inset-0 z-[-1]',
								isTextNode && 'bg-white',
								!isTextNode && 'rounded-sm',
							)}
						/>
						{!isGroup && <div className={cn('overflow-hidden')}>{children}</div>}

						{!isTextNode && !isGroup && (
							<TextAreaElement
								value={thisNode.data.inputValue || ''}
								onChange={(event) => updateNodeText(event.target.value)}
								onFocus={() => setWSValue({ isEditingText: true })}
								onBlur={() => setWSValue({ isEditingText: false })}
								autoAdjustHeight={true}
								spellCheck={false}
								inputClassName={cn(
									'no-scrollbar min-h-0 resize-none rounded-none !border-none p-0 text-center text-[10px] leading-snug !ring-0 !ring-offset-0 bg-transparent',
								)}
								containerClassName="absolute inset-[103%_0_auto_0]"
							/>
						)}
					</div>
				</ContextMenuTrigger>

				<ContextMenuContent className="w-48">
					{workflowNodeMenuItems.map((item) => (
						<ContextMenuItem
							key={item.id}
							onClick={item.onClick}
							className="flex cursor-pointer items-center"
						>
							<item.icon className="mr-2 size-4" />
							<span>{item.label}</span>
						</ContextMenuItem>
					))}
				</ContextMenuContent>
			</ContextMenu>

			<ConnectHandles nodeId={nodeId} />
		</>
	);
}
