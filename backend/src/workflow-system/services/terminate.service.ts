import { Injectable } from '@nestjs/common';

import { loadNodeClass } from '../workflow-system.util';
import { WorkflowListenersService } from './listener.service';
import GeneralBaseNode from '../nodes/base-node/general/GeneralBaseNode';
import { WorkflowCacheService } from './cache.service';
import { WorkflowPrivateService } from 'src/workflow/workflow.private';
import { WorkflowService } from 'src/workflow/workflow.service';
import { isError } from 'src/shared/utils/error.util';

/**
 * @summary Workflow terminator service
 * @description Service for handling workflow termination operations
 * @functions
 * - terminateWorkflow
 */
@Injectable()
export class WorkflowTerminatorService {
	constructor(
		private readonly workflowCacheService: WorkflowCacheService,

		private readonly workflowService: WorkflowService,
		private readonly workflowPrivateService: WorkflowPrivateService,
		private readonly workflowListenersService: WorkflowListenersService,
	) {}

	async terminateWorkflow(workflowId: string) {
		const workflow = await this.workflowPrivateService.getWorkflowInternal(workflowId);
		if (isError(workflow)) {
			return {
				...workflow,
				trace: [...workflow.trace, 'WorkflowTerminatorService_terminateWorkflow'],
			};
		}

		for (const node of workflow.nodes) {
			if (node.category === 'Tool' || node.category === 'Responder') continue;

			const nodeInstance = await loadNodeClass({ type: node.type, category: 'all' });
			if (isError(nodeInstance)) continue;

			if (node.category === 'Trigger') {
				let uniqueKey = '';

				if (node.type === 'telegram-trigger') {
					uniqueKey = workflow.config[node.id]?.accessToken || '';
				} else if (
					[
						'discord-trigger',
						'slack-trigger',
						'cron-trigger',
						'google-sheets-trigger',
						'whatsapp-trigger',
					].includes(node.type)
				) {
					uniqueKey = node.id;
				}

				await this.workflowListenersService.deleteListener({ type: node.type, uniqueKey });
			} else {
				const response = await (nodeInstance as GeneralBaseNode).terminate();
				if (isError(response)) {
					return {
						...response,
						trace: [...response.trace, 'WorkflowTerminatorService_terminateWorkflowNodes'],
					};
				}
			}
		}

		await this.workflowCacheService.deleteWorkflowCache(workflowId);
		await this.workflowCacheService.deleteExecutionCacheByWorkflow(workflowId);

		const updatedWorkflow = await this.workflowService.updateWorkflow({
			workflowId,
			updates: { status: 'inactive' },
			userId: undefined,
		});
		if (isError(updatedWorkflow)) {
			return {
				...updatedWorkflow,
				trace: [...updatedWorkflow.trace, 'WorkflowTerminatorService_terminateWorkflow'],
			};
		}

		return updatedWorkflow;
	}
}
