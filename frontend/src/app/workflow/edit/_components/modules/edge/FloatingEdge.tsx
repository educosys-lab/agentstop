import { CSSProperties } from 'react';
import { getBezierPath, useInternalNode } from '@xyflow/react';

import { getEdgeParams } from '../../utils/floating-edge.util';
import { TargetNodeType } from '../../types/edge.type';

type FloatingEdgePropsType = {
	id: string;
	source: string;
	target: string;
	markerStart?: string;
	markerEnd?: string;
	style?: CSSProperties;
};

export default function FloatingEdge({ id, source, target, markerStart, markerEnd, style }: FloatingEdgePropsType) {
	const sourceNode = useInternalNode(source);
	const targetNode = useInternalNode(target) as TargetNodeType;

	if (!sourceNode || !targetNode) return null;

	const { sx, sy, tx, ty, sourcePos, targetPos } = getEdgeParams(sourceNode, targetNode);

	const [edgePath] = getBezierPath({
		sourceX: sx,
		sourceY: sy,
		sourcePosition: sourcePos,
		targetPosition: targetPos,
		targetX: tx,
		targetY: ty,
	});

	return (
		<>
			{/* Invisible wider stroke for easier interaction */}
			<path
				d={edgePath}
				onMouseDown={(event) => event.preventDefault()}
				style={style}
				className="react-flow__edge-path interaction"
			/>

			{/* Actual visible edge */}
			<path
				id={id}
				d={edgePath}
				markerStart={markerStart}
				markerEnd={markerEnd}
				style={style}
				className="react-flow__edge-path"
			/>
		</>
	);
}
