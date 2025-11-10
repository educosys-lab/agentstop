import FloatingEdge from '../modules/edge/FloatingEdge';

export enum EdgeVariant {
	DEFAULT = 'floating',
}

export const workflowEdges = {
	[EdgeVariant.DEFAULT]: FloatingEdge,
};

export type TargetNodeType = {
	id: string;
	measured: { width: number; height: number };
	internals: { positionAbsolute: { x: number; y: number } };
};
