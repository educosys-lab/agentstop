import { CSSProperties } from 'react';
import { Handle, Position } from '@xyflow/react';

import { useWorkflowEditor } from '../../hooks/useWorkflowEditor.hook';

const commonStyles = { border: 'none', borderRadius: '0', background: 'transparent', transform: 'none' };
const xAxis = { ...commonStyles, left: 0, right: 0, width: '100%', height: '10%' };
const yAxis = { ...commonStyles, top: 0, bottom: 0, width: '10%', height: '100%' };

type ConnectHandlesProps = {
	nodeId: string | null;
};

export default function ConnectHandles({ nodeId }: ConnectHandlesProps) {
	const { selectedNodeIds } = useWorkflowEditor();

	const connectingPointStyles: CSSProperties = {
		opacity: nodeId && selectedNodeIds.includes(nodeId) ? '100%' : '0',
	};

	return (
		<>
			{/* Target Handles */}
			<Handle id="0" type="target" position={Position.Top} style={xAxis} />
			<Handle id="1" type="target" position={Position.Right} style={yAxis} />
			<Handle id="2" type="target" position={Position.Bottom} style={xAxis} />
			<Handle id="3" type="target" position={Position.Left} style={yAxis} />

			{/* Source Handles */}
			<Handle id="8" type="source" position={Position.Top} style={{ ...xAxis, ...connectingPointStyles }} />
			<Handle id="9" type="source" position={Position.Right} style={{ ...yAxis, ...connectingPointStyles }} />
			<Handle id="10" type="source" position={Position.Bottom} style={{ ...xAxis, ...connectingPointStyles }} />
			<Handle id="11" type="source" position={Position.Left} style={{ ...yAxis, ...connectingPointStyles }} />
		</>
	);
}
