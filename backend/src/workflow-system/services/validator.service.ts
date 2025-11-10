import { Injectable } from '@nestjs/common';

import { UserService } from 'src/user/user.service';
import { WorkflowType } from 'src/workflow/workflow.type';
import { DefaultReturnType } from 'src/shared/types/return.type';
import { WorkflowPrivateService } from 'src/workflow/workflow.private';
import { isError } from 'src/shared/utils/error.util';
/**
 * @summary Workflow validator service
 * @description Service for handling workflow validator operations
 * @functions
 * - workflowActivateValidator
 * - workflowTriggerValidator
 */
@Injectable()
export class WorkflowValidatorService {
	constructor(
		private readonly userService: UserService,
		private readonly workflowPrivateService: WorkflowPrivateService,
	) {}

	/**
	 * Workflow activate validator
	 */
	async workflowActivateValidator(props: {
		userId: string;
		workflowId: string;
	}): Promise<DefaultReturnType<WorkflowType>> {
		const { userId, workflowId } = props;

		const user = await this.userService.getUser({ id: userId });
		if (isError(user)) {
			return {
				...user,
				trace: ['WorkflowValidatorService - workflowActivateValidator - this.userService.getUser'],
			};
		}

		if (user.accountStatus !== 'active') {
			return {
				userMessage: 'User account is not active!',
				error: 'User account is not active!',
				errorType: 'ForbiddenException',
				errorData: { userId },
				trace: ['WorkflowValidatorService - workflowActivateValidator - user.accountStatus !== active'],
			};
		}

		const workflow = await this.workflowPrivateService.getWorkflowInternal(workflowId);
		if (isError(workflow)) {
			return {
				...workflow,
				trace: [
					'WorkflowValidatorService - workflowActivateValidator - this.workflowPrivateService.getWorkflowInternal',
				],
			};
		}

		if (workflow.status === 'deleted') {
			return {
				userMessage: 'Workflow has been deleted!',
				error: 'Workflow has been deleted!',
				errorType: 'NotFoundException',
				errorData: { workflowId },
				trace: ['WorkflowValidatorService - workflowActivateValidator - workflow.status === "deleted"'],
			};
		}

		if (workflow.createdBy !== userId) {
			return {
				userMessage: 'Workflow does not belong to user!',
				error: 'Workflow does not belong to user!',
				errorType: 'ForbiddenException',
				errorData: { userId, workflowId },
				trace: ['WorkflowValidatorService - workflowActivateValidator - workflow.createdBy !== userId'],
			};
		}

		return workflow;
	}

	/**
	 * Workflow trigger validator
	 */
	async workflowTriggerValidator(): Promise<DefaultReturnType<true>> {
		return true;
	}
}
