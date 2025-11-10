import { Edge as ReactFlowEdge } from '@xyflow/react';

import { ReactFlowNode } from '../edit/_components/types/workflow-editor.type';
import { AxiosError, AxiosResponse } from 'axios';

export const WORKFLOW_STATUS = {
	LIVE: 'live',
	INACTIVE: 'inactive',
	DELETED: 'deleted',
} as const;

export type WorkflowStatusType = (typeof WORKFLOW_STATUS)[keyof typeof WORKFLOW_STATUS];

export const COLLABORATION_ACCESS = {
	EDIT: 'edit',
	VIEW: 'view',
} as const;

export type CollaborationAccessType = (typeof COLLABORATION_ACCESS)[keyof typeof COLLABORATION_ACCESS];

export type WorkflowType = {
	id: string;
	title: string;
	createTime: number;
	updateTime: number;
	nodes: ReactFlowNode[];
	edges: ReactFlowEdge[];
	creator: { name: string; username: string; image: string };
	isPublic: boolean;
	preview: string;
	notes: string;
	status: WorkflowStatusType;
	config: { [key: string]: any };
	generalSettings: { [key: string]: any };
	report: {
		successExecutions: number;
		failedExecutions: number;
	};
};

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

export type UpdateWorkflowType = Partial<
	Omit<WorkflowType, 'id' | 'createTime' | 'config' | 'report'> & {
		config: { nodeId: string; updates: Partial<WorkflowType['config']> }[];
	}
>;

export type CreateWorkflowType = {
	createdBy: string;
	title: WorkflowType['title'];
};

export type TestNodeResponseType =
	| { status: 'success'; response: AxiosResponse }
	| { status: 'failed'; response: AxiosError };
