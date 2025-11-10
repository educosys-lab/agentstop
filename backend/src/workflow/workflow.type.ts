import { UserType } from 'src/user/user.type';
import { NodeMetadataType, NodeVariantType } from 'src/workflow-system/workflow-system.type';

export const WORKFLOW_STATUS = ['live', 'inactive', 'deleted'] as const;
export type WorkflowStatusType = (typeof WORKFLOW_STATUS)[number];

export const WORKFLOW_EXECUTION_STATUS = ['started', 'success', 'failed'] as const;
export type WorkflowExecutionStatusType = (typeof WORKFLOW_EXECUTION_STATUS)[number];

export type WorkflowType = {
	id: string;
	createdBy: UserType['id'];
	title: string;
	createTime: number;
	updateTime: number;
	nodes: NodeType[];
	edges: EdgeType[];
	isPublic: boolean;
	preview: string;
	notes: string;
	status: WorkflowStatusType;
	config: Record<string, any>;
	report: {
		executionId: string;
		executionTime: number;
		executionStatus: WorkflowExecutionStatusType;
	}[];
	generalSettings: {
		showResultFromAllNodes: boolean;
	};
};

export const omittedWorkflowFields = ['_id', '__v', 'createdBy', 'report'] as const;

export type UserWorkflowType = {
	id: string;
	title: string;
	createTime: number;
	updateTime: number;
	isPublic: boolean;
	status: WorkflowStatusType;
	report: {
		successExecutions: number;
		failedExecutions: number;
	};
};

export type PublicWorkflowType = Omit<WorkflowType, (typeof omittedWorkflowFields)[number]> & {
	creator: { name: string; username: string; image: string };
	report: {
		successExecutions: number;
		failedExecutions: number;
	};
};

export type UpdateWorkflowType = Partial<
	Omit<WorkflowType, 'id' | 'createdBy' | 'createTime' | 'config' | 'report'> & {
		config: { nodeId: string; updates: Partial<WorkflowType['config']> }[];
		report:
			| ({ executionId: string } & Partial<Omit<WorkflowType['report'][number], 'executionId' | 'executionTime'>>)
			| WorkflowType['report'][number];
	}
>;

export type MarketplaceWorkflowListType = {
	id: string;
	title: string;
	createTime: number;
	updateTime: number;
	creator: { name: string; username: string; image: string };
};

// ========= Workflow Node Types ========== //
export type NodeType = {
	id: string;
	type: NodeVariantType;
	category: NodeMetadataType['category'];
	[key: string]: any;
};

// ======== Workflow Edge Types ========== //
export type EdgeType = { id: string; source: string; target: string; [key: string]: any };
