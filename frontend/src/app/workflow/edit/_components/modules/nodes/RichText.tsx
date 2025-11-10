'use client';

import { useRef } from 'react';
import { Editor } from '@tiptap/react';
import { useNodeId, useReactFlow, useNodes } from '@xyflow/react';

import { ReactFlowNode } from '../../types/workflow-editor.type';

import { useTimeout } from '@/hooks/useTimeout.hook';
import { workflowStore } from '@/app/workflow/_store/workflow.store';
import { useWorkflowEditor } from '../../hooks/useWorkflowEditor.hook';

import NodeContainer from './NodeContainer';
import { TextEditor } from '../text-editor/TextEditor';

export default function RichText() {
	const nodeId = useNodeId();
	const timeout = useTimeout();
	const { selectedNodeIds } = useWorkflowEditor();
	const nodes = useNodes() as ReactFlowNode[];
	const { setNodes } = useReactFlow();

	const setWSValue = workflowStore((state) => state.setWSValue);

	const editorRef = useRef<{ editor: Editor | null } | null>(null);

	const isThisNodeSelected = nodeId && selectedNodeIds.includes(nodeId) ? true : false;
	const editorContent = nodes.find((node) => node.id === nodeId)?.data.inputValue || '';

	const updateContent = (content: string) => {
		timeout(async () => {
			const updatedNodes = [...nodes];
			const thisNodeIndex = updatedNodes.findIndex((node) => node.id === nodeId);
			updatedNodes[thisNodeIndex].data.inputValue = content;
			setNodes(updatedNodes);
		}, 2000);
	};

	const onFocus = () => {
		setWSValue({ isEditingText: true });
		if (editorRef.current) setWSValue({ activeTextEditor: editorRef.current.editor });
	};

	const onBlur = () => setWSValue({ isEditingText: false });

	const onUpdateFontSize = (fontSize: number) => setWSValue({ activeTextEditorFontSize: fontSize });

	const onUpdateTextColor = (textColor: string) => setWSValue({ activeTextColor: textColor });

	return (
		<NodeContainer>
			<TextEditor
				ref={editorRef}
				content={editorContent}
				onFocus={onFocus}
				onBlur={onBlur}
				onUpdateFontSize={onUpdateFontSize}
				onUpdateTextColor={onUpdateTextColor}
				onUpdateContent={updateContent}
				isSelected={isThisNodeSelected}
			/>
		</NodeContainer>
	);
}
