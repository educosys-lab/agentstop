import { useCallback, useRef, useState, useEffect } from 'react';
import { Edge, useEdges, useNodes, useReactFlow } from '@xyflow/react';

import { DATA } from '@/constants/data.constant';
import { ReactFlowNode } from '../types/workflow-editor.type';

type HistoryItem = {
	nodes: ReactFlowNode[];
	edges: Edge[];
};

export function useUndoRedo() {
	const nodes = useNodes() as ReactFlowNode[];
	const edges = useEdges();
	const { setNodes, setEdges } = useReactFlow();

	const [canUndo, setCanUndo] = useState(false);
	const [canRedo, setCanRedo] = useState(false);

	const historyRef = useRef<HistoryItem[]>([]);
	const currentIndexRef = useRef(-1);
	const isUndoingOrRedoing = useRef(false);
	const timeoutRef = useRef<NodeJS.Timeout | null>(null);

	const updateUndoRedoState = useCallback(() => {
		setCanUndo(currentIndexRef.current > 0);
		setCanRedo(currentIndexRef.current < historyRef.current.length - 1);
	}, []);

	const takeSnapshot = useCallback(() => {
		if (isUndoingOrRedoing.current) return;

		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current);
		}

		timeoutRef.current = setTimeout(() => {
			const newHistoryItem = { nodes, edges };

			if (currentIndexRef.current < historyRef.current.length - 1) {
				historyRef.current = historyRef.current.slice(0, currentIndexRef.current + 1);
			}

			historyRef.current.push(newHistoryItem);
			currentIndexRef.current++;

			if (historyRef.current.length > DATA.WORKFLOW_UNDO_REDO_MAX_STEPS_ALLOWED) {
				historyRef.current.shift();
				currentIndexRef.current--;
			}

			updateUndoRedoState();
		}, 50);
	}, [nodes, edges, updateUndoRedoState]);

	const applyState = useCallback(
		async (state: HistoryItem) => {
			setNodes(state.nodes);
			setEdges(state.edges);
		},
		[setNodes, setEdges],
	);

	// Undo to the previous state
	const onUndo = useCallback(async () => {
		if (currentIndexRef.current > 0) {
			isUndoingOrRedoing.current = true;
			currentIndexRef.current--;
			const previousState = historyRef.current[currentIndexRef.current];
			await applyState(previousState);
			updateUndoRedoState();
			isUndoingOrRedoing.current = false;
		}
	}, [applyState, updateUndoRedoState]);

	// Redo to the next state
	const onRedo = useCallback(async () => {
		if (currentIndexRef.current < historyRef.current.length - 1) {
			isUndoingOrRedoing.current = true;
			currentIndexRef.current++;
			const nextState = historyRef.current[currentIndexRef.current];
			await applyState(nextState);
			updateUndoRedoState();
			isUndoingOrRedoing.current = false;
		}
	}, [applyState, updateUndoRedoState]);

	const handleChanges = useCallback(() => {
		if (!isUndoingOrRedoing.current) {
			takeSnapshot();
		}
	}, [takeSnapshot]);

	useEffect(() => {
		// Take an initial snapshot when the component mounts
		if (historyRef.current.length === 0) {
			takeSnapshot();
		}
	}, [takeSnapshot]);

	useEffect(() => {
		// Take a snapshot whenever nodes or edges change
		if (historyRef.current.length > 0) {
			const lastSnapshot = historyRef.current[currentIndexRef.current];
			if (
				JSON.stringify(lastSnapshot.nodes) !== JSON.stringify(nodes) ||
				JSON.stringify(lastSnapshot.edges) !== JSON.stringify(edges)
			) {
				takeSnapshot();
			}
		}
	}, [nodes, edges, takeSnapshot]);

	useEffect(() => {
		return () => {
			if (timeoutRef.current) clearTimeout(timeoutRef.current);
		};
	}, []);

	return { onUndo, onRedo, takeSnapshot, handleChanges, canUndo, canRedo };
}
