import { Injectable } from '@nestjs/common';

import { WorkflowService } from 'src/workflow/workflow.service';
import { PublicWorkflowType } from 'src/workflow/workflow.type';
import { DefaultReturnType } from 'src/shared/types/return.type';
import { isError } from 'src/shared/utils/error.util';

/**
 * @summary Workflow update service
 * @description Service for handling workflow update operations
 * @functions
 * - activateWorkflowUpdate
 */
@Injectable()
export class WorkflowUpdateService {
	constructor(private readonly workflowService: WorkflowService) {}

	/**
	 * Activate workflow update
	 */
	async activateWorkflowUpdate(workflowId: string): Promise<DefaultReturnType<PublicWorkflowType>> {
		const updatedWorkflow = await this.workflowService.updateWorkflow({
			workflowId,
			updates: { status: 'live' },
			userId: undefined,
		});
		if (isError(updatedWorkflow)) {
			return {
				...updatedWorkflow,
				trace: ['WorkflowUpdateService - activateWorkflowUpdate - this.workflowService.updateWorkflow'],
			};
		}

		const publicWorkflowData = await this.workflowService.getPublicWorkflowData([updatedWorkflow]);
		if (isError(publicWorkflowData)) {
			return {
				...publicWorkflowData,
				trace: ['WorkflowUpdateService - activateWorkflowUpdate - this.workflowService.getPublicWorkflowData'],
			};
		}

		return publicWorkflowData[0];
	}
}
