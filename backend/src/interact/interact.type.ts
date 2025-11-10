import { ResponderDataFormatType } from 'src/workflow-system/workflow-system.type';
import { WorkflowStatusType } from 'src/workflow/workflow.type';

export type InteractType = {
	workflowId: string;
	messages: {
		id: string;
		createTime: number;
		senderId: string;
		content: string;
		format: ResponderDataFormatType;
	}[];
	members: {
		userId: string;
		joinTime: number;
		isDeleted: boolean;
	}[];
	isDeleted: boolean;
};

export const omittedInteractFields = ['_id', '__v', 'messages', 'members'] as const;

export type PublicInteractType = Omit<InteractType, (typeof omittedInteractFields)[number]> & {
	workflowTitle: string;
	messages: {
		id: string;
		createTime: number;
		name: string;
		username: string;
		content: string;
		format: ResponderDataFormatType;
	}[];
	members: { name: string; username: string; image: string }[];
	status: WorkflowStatusType;
};

export type UserInteractsType = {
	workflowId: string;
	workflowTitle: string;
	status: WorkflowStatusType;
};

export type AddInteractMessageType = {
	userId: string;
	id: string;
	workflowId: string;
	content: string;
	format: ResponderDataFormatType;
	isInternal: boolean;
	showTempData?: boolean;
};

export type AddInteractMembersType = {
	workflowId: string;
	emailOrUsername: string[];
};

export type DeleteInteractMembersType = {
	workflowId: string;
	emailOrUsername: string[];
};

export type InteractResponseType<T> =
	| { status: 'success'; data: T; message: null }
	| { status: 'failed'; data: null; message: string };
