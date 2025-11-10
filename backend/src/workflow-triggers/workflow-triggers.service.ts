import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { WorkflowTriggersType } from './workflow-triggers.type';
import { DefaultReturnType } from 'src/shared/types/return.type';
import { returnErrorString } from 'src/shared/utils/return.util';
import { isError } from 'src/shared/utils/error.util';

/**
 * @summary Workflow triggers service
 * @description Service for handling workflow triggers operations
 * @functions
 * - getTrigger
 * - addTrigger
 * - getTriggersByWorkflowId
 * - deleteTrigger
 */
@Injectable()
export class WorkflowTriggersService {
	constructor(
		@InjectModel('WorkflowTrigger')
		private readonly WorkflowTriggerModel: Model<WorkflowTriggersType>,
	) {}

	/**
	 * Get trigger
	 */
	async getTrigger(
		content: string,
	): Promise<DefaultReturnType<(WorkflowTriggersType & { _id: Types.ObjectId; __v: number })[]>> {
		try {
			const data = await this.WorkflowTriggerModel.find({ content }).lean().exec();
			return data;
		} catch (error) {
			return {
				userMessage: 'Internal server error!',
				error: 'Error getting trigger!',
				errorType: 'InternalServerErrorException',
				errorData: {
					content,
					error: returnErrorString(error),
				},
				trace: ['WorkflowTriggersService - getTrigger - catch'],
			};
		}
	}

	/**
	 * Add trigger
	 */
	async addTrigger(trigger: WorkflowTriggersType): Promise<DefaultReturnType<true>> {
		try {
			const triggerData = await this.getTrigger(trigger.content);
			if (isError(triggerData)) return triggerData;

			if (triggerData.length > 0) {
				return {
					userMessage: 'Trigger already exists!',
					error: 'Trigger already exists!',
					errorType: 'ConflictException',
					errorData: { content: trigger.content },
					trace: ['WorkflowTriggersService - addTrigger - if (triggerData.length > 0)'],
				};
			}

			const response = await this.WorkflowTriggerModel.create(trigger);
			if (!response) {
				return {
					userMessage: 'Error creating trigger!',
					error: 'Error creating trigger!',
					errorType: 'InternalServerErrorException',
					errorData: { content: trigger.content },
					trace: ['WorkflowTriggersService - addTrigger - if (!response)'],
				};
			}

			return true;
		} catch (error) {
			return {
				userMessage: 'Error creating trigger!',
				error: 'Error creating trigger!',
				errorType: 'InternalServerErrorException',
				errorData: {
					trigger,
					error: returnErrorString(error),
				},
				trace: ['WorkflowTriggersService - addTrigger - catch'],
			};
		}
	}

	/**
	 * Get triggers by workflow ID
	 */
	async getTriggersByWorkflowId(
		workflowId: string,
	): Promise<DefaultReturnType<(WorkflowTriggersType & { _id: Types.ObjectId; __v: number })[]>> {
		try {
			const data = await this.WorkflowTriggerModel.find({ workflowId }).lean().exec();
			return data;
		} catch (error) {
			return {
				userMessage: 'Internal server error!',
				error: 'Error getting trigger by workflowId!',
				errorType: 'InternalServerErrorException',
				errorData: {
					workflowId,
					error: returnErrorString(error),
				},
				trace: ['WorkflowTriggersService - getTriggersByWorkflowId - catch'],
			};
		}
	}

	/**
	 * Delete trigger
	 */
	async deleteTrigger(content: string): Promise<DefaultReturnType<true>> {
		try {
			await this.WorkflowTriggerModel.deleteOne({ content }).exec();
			return true;
		} catch (error) {
			return {
				userMessage: 'Error deleting trigger!',
				error: 'Error deleting trigger!',
				errorType: 'InternalServerErrorException',
				errorData: {
					content,
					error: returnErrorString(error),
				},
				trace: ['WorkflowTriggersService - deleteTrigger - catch'],
			};
		}
	}
}
