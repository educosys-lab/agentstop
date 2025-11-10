import { WorkflowStatusType } from '@/app/workflow/_types/workflow.type';

export const responderDataFormats = ['string', 'json'] as const;

export type ResponderDataFormatType = (typeof responderDataFormats)[number];

export type InteractType = {
	workflowId: string;
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

export type AddMessageType = {
	id: string;
	workflowId: string;
	content: string;
	format: ResponderDataFormatType;
};

export type UpdateMembersType = {
	workflowId: string;
	email: string[] | undefined;
	username: string[] | undefined;
};

export type HandleInteractType =
	| { action: 'getInteract'; data: { workflowId: string } }
	| { action: 'getUserInteracts' }
	| { action: 'sendInteractMessage'; data: AddMessageType }
	| { action: 'addInteractMembers'; data: UpdateMembersType }
	| { action: 'deleteInteractMembers'; data: UpdateMembersType };

export type InteractWebsocketActionsResponseType<T> =
	| { status: 'success'; content: T }
	| { status: 'failed'; content: string };
