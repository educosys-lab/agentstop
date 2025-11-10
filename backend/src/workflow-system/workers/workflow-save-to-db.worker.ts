import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';

import { QUEUE } from 'src/shared/queue/queue.constant';
import { log } from 'src/shared/logger/logger';
import { WorkflowService } from 'src/workflow/workflow.service';
import { isError } from 'src/shared/utils/error.util';
import { returnErrorString } from 'src/shared/utils/return.util';

@Processor(QUEUE.WORKFLOW_SAVE_TO_DB_QUEUE, { concurrency: 1 })
export class WorkflowSaveToDbWorker extends WorkerHost {
	constructor(private readonly workflowService: WorkflowService) {
		super();
	}

	async process(job: Job): Promise<void> {
		const workflowId = job.data.workflowId;
		const updates = job.data.updates;

		try {
			const updateResponse = await this.workflowService.updateWorkflow({
				workflowId,
				updates,
				userId: undefined,
			});
			if (isError(updateResponse)) {
				log('workflow-save-to-db', 'error', {
					message: updateResponse.error,
					data: updateResponse.errorData,
					trace: [
						...updateResponse.trace,
						'WorkflowSaveToDbWorker - process - this.workflowService.updateWorkflow',
					],
				});
			}
		} catch (error) {
			log('workflow-save-to-db', 'error', {
				message: 'Error processing job',
				data: { job, error: returnErrorString(error) },
				trace: ['WorkflowSaveToDbWorker - process - catch'],
			});
		}
	}

	// @OnWorkerEvent('active')
	// onAdded(job: Job) {
	// 	console.log('workflow-save-to-db', 'info', `Job ${job.id} active`);
	// }

	// @OnWorkerEvent('completed')
	// onJobCompleted(job: Job) {
	// 	console.log('workflow-save-to-db', 'info', `Job ${job.id} completed`);
	// }

	@OnWorkerEvent('failed')
	onJobFailed(job: Job) {
		log('workflow-save-to-db', 'error', {
			message: 'Job failed',
			data: { workflowId: job.data.workflowId },
			trace: ['WorkflowSaveToDbWorker - onJobFailed'],
		});
	}
}
