import { Node as DefaultReactFlowNode } from '@xyflow/react';

import { WorkflowNodeMetaType } from './tool-node-config.type';

export type WorkflowNodeCommonDataProps = {
	inputValue: string;
	fontSize?: number;
};

export type ReactFlowNode = DefaultReactFlowNode & {
	type: string;
	category: WorkflowNodeMetaType['category'];
	data: WorkflowNodeCommonDataProps;
};
