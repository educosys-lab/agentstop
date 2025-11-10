import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { WorkflowType } from './workflow.type';
import { getMultipleWorkflowsInternalValidation, getWorkflowInternalValidation } from './workflow.validate';
import { DefaultReturnType } from 'src/shared/types/return.type';
import { validate } from 'src/shared/utils/zod.util';
import { isError } from 'src/shared/utils/error.util';

/**
 * @summary Workflow private service
 * @description Service for handling workflow operations. This is only for internal use.
 * @functions
 * - getWorkflowInternal
 * - getMultipleWorkflowsInternal
 */
@Injectable()
export class WorkflowPrivateService {
	constructor(@InjectModel('Workflow') private WorkflowModel: Model<WorkflowType>) {}

	/**
	 * Get workflow
	 */
	async getWorkflowInternal(workflowId: string): Promise<DefaultReturnType<WorkflowType>> {
		const validationResult = validate({ data: { workflowId }, schema: getWorkflowInternalValidation });
		if (isError(validationResult)) {
			return {
				...validationResult,
				trace: [
					...validationResult.trace,
					'WorkflowPrivateService - getWorkflowInternal - if ("error" in validationResult)',
				],
			};
		}

		const workflow = await this.WorkflowModel.findOne({ id: validationResult.workflowId }).lean().exec();
		if (!workflow) {
			return {
				userMessage: 'Workflow does not exist!',
				error: 'Workflow does not exist!',
				errorType: 'NotFoundException',
				errorData: { workflowId },
				trace: ['WorkflowPrivateService - getWorkflowInternal - if (!workflow)'],
			};
		}

		return workflow;
	}

	/**
	 * Get multiple workflows
	 */
	async getMultipleWorkflowsInternal(workflowIds: string[] | undefined): Promise<DefaultReturnType<WorkflowType[]>> {
		const validationResult = validate({ data: { workflowIds }, schema: getMultipleWorkflowsInternalValidation });
		if (isError(validationResult)) {
			return {
				...validationResult,
				trace: [
					...validationResult.trace,
					'WorkflowPrivateService - getMultipleWorkflowsInternal - if ("error" in validationResult)',
				],
			};
		}

		if (workflowIds) {
			const workflows = await this.WorkflowModel.find({ id: { $in: workflowIds } })
				.lean()
				.exec();
			if (!workflows) {
				return {
					userMessage: 'Error fetching workflows!',
					error: 'Error fetching workflows!',
					errorType: 'InternalServerErrorException',
					errorData: { workflowIds },
					trace: ['WorkflowPrivateService - getMultipleWorkflows - if (!workflows)'],
				};
			}

			return workflows;
		}

		const allWorkflows = await this.WorkflowModel.find().lean().exec();
		if (!allWorkflows) {
			return {
				userMessage: 'Error fetching workflows!',
				error: 'Error fetching workflows!',
				errorType: 'InternalServerErrorException',
				errorData: {},
				trace: ['WorkflowPrivateService - getMultipleWorkflows - if (!allWorkflows)'],
			};
		}

		return allWorkflows;
	}
}
