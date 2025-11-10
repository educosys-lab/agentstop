import { WorkflowNodeMetaType } from '../../types/tool-node-config.type';

import { ImageElement } from '@/components/elements/ImageElement';
import NodeContainer from './NodeContainer';

export function nodeBuilder(tool: WorkflowNodeMetaType) {
	return function nodeBuilder() {
		return (
			<NodeContainer>
				<ImageElement src={tool.icon} alt={tool.label} className="size-full" />
			</NodeContainer>
		);
	};
}
