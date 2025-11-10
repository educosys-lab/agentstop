import { Injectable, OnApplicationBootstrap } from '@nestjs/common';

import { log } from 'src/shared/logger/logger';
import { WorkflowSystemService } from './system.service';
import { WorkflowPrivateService } from 'src/workflow/workflow.private';
import { returnErrorString } from 'src/shared/utils/return.util';
import { isError } from 'src/shared/utils/error.util';

/**
 * @summary Workflow startup service
 * @description Service for handling workflow startup operations
 * @functions
 * - onApplicationBootstrap
 * - restartListeners
 */
@Injectable()
export class WorkflowStartupService implements OnApplicationBootstrap {
	constructor(
		private readonly workflowPrivateService: WorkflowPrivateService,
		private readonly workflowSystemService: WorkflowSystemService,
	) {}

	/**
	 * On application bootstrap
	 */
	async onApplicationBootstrap() {
		// if (process.env.NODE_ENV === 'local') return;
		await this.restartListeners();
	}

	/**
	 * Restart listeners
	 */
	async restartListeners() {
		try {
			const workflows = await this.workflowPrivateService.getMultipleWorkflowsInternal(undefined);
			if (isError(workflows)) {
				log('workflow', 'error', {
					message: workflows.userMessage,
					data: workflows.errorData,
					trace: [
						...workflows.trace,
						'WorkflowStartupService - restartListeners - this.workflowPrivateService.getMultipleWorkflowsInternal',
					],
				});
				return;
			}

			if (workflows.length < 1) return;

			const runningWorkflows = workflows.filter((workflow) => workflow.status === 'live');

			for (const workflow of runningWorkflows) {
				const response = await this.workflowSystemService.activateWorkflowInternal(workflow.id);
				if (isError(response)) {
					log('workflow', 'error', {
						message: response.userMessage,
						data: response.errorData,
						trace: [
							...response.trace,
							'WorkflowStartupService - restartListeners - this.workflowSystemService.activateWorkflowInternal',
						],
					});
				}
			}
		} catch (error) {
			log('workflow', 'error', {
				message: 'Error restarting listeners!',
				data: { error: returnErrorString(error) },
				trace: ['WorkflowStartupService - restartListeners - catch'],
			});
		}
	}
}
