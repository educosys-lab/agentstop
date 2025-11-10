import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';

import { QUEUE } from 'src/shared/queue/queue.constant';
import { log } from 'src/shared/logger/logger';
import { WorkflowSystemService } from '../services/system.service';
import { WorkflowExecutionStatusType } from 'src/workflow/workflow.type';
import { isError } from 'src/shared/utils/error.util';
import { WorkflowResponderService } from '../services/responder.service';
import { WorkflowCacheService } from '../services/cache.service';
import { GeneralNodeReturnType } from '../workflow-system.type';
import { returnErrorString } from 'src/shared/utils/return.util';
import { QueueService } from 'src/shared/queue/queue.service';

@Processor(QUEUE.WORKFLOW_SYSTEM_QUEUE)
export class WorkflowSystemWorker extends WorkerHost {
	constructor(
		private readonly queueService: QueueService,

		private readonly workflowSystemService: WorkflowSystemService,
		private readonly workflowResponderService: WorkflowResponderService,
		private readonly workflowCacheService: WorkflowCacheService,
	) {
		super();
	}

	async process(job: Job): Promise<void> {
		const executionId = job.data.executionId;
		const workflowId = job.data.workflowId;

		let response: { status: GeneralNodeReturnType['status']; content?: string } | null = null;
		let userErrorMessage = '';

		try {
			const executeWorkflowResponse = await this.workflowSystemService.executeWorkflow(executionId);
			if (isError(executeWorkflowResponse)) {
				userErrorMessage = executeWorkflowResponse.userMessage;

				log('workflow', 'error', {
					message: executeWorkflowResponse.error,
					data: { executionId: executionId, ...executeWorkflowResponse.errorData },
					trace: [
						...executeWorkflowResponse.trace,
						'WorkflowSystemWorker - process - this.workflowSystemService.executeWorkflow',
					],
				});
			} else {
				response = executeWorkflowResponse;
			}
		} catch (error) {
			userErrorMessage = 'Error processing mission!';

			log('workflow', 'error', {
				message: 'Error processing job',
				data: {
					job,
					error: returnErrorString(error),
				},
				trace: ['WorkflowSystemWorker - process - catch'],
			});
		} finally {
			await this.processResponse({
				response,
				executionId,
				workflowId,
				userErrorMessage,
			});
			await this.workflowCacheService.deleteExecutionCache(executionId);
		}
	}

	// @OnWorkerEvent('active')
	// onAdded(job: Job) {
	// 	console.log('workflow', 'info', `Job ${job.id} active`);
	// }

	// @OnWorkerEvent('completed')
	// onJobCompleted(job: Job) {
	// 	console.log('workflow', 'info', `Job ${job.id} completed`);
	// }

	@OnWorkerEvent('failed')
	onJobFailed(job: Job) {
		log('workflow', 'error', {
			message: 'Job failed',
			data: { executionId: job.data.executionId },
			trace: ['WorkflowSystemWorker - onJobFailed'],
		});
	}

	private async processResponse(props: {
		response: { status: GeneralNodeReturnType['status']; content?: string } | null;
		executionId: string;
		workflowId: string;
		userErrorMessage: string;
	}) {
		const { response, executionId, workflowId, userErrorMessage } = props;

		const executionStatus: WorkflowExecutionStatusType = response
			? response.status === 'hold'
				? 'started'
				: response.status
			: 'failed';

		const queueAddResponse = await this.queueService.add({
			queueName: QUEUE.WORKFLOW_SAVE_TO_DB_QUEUE,
			key: 'saveReportToDb',
			data: { workflowId, updates: { report: { executionId, executionStatus } } },
		});
		if (isError(queueAddResponse)) {
			log('workflow', 'error', {
				message: queueAddResponse.error,
				data: { executionId, executionStatus, ...queueAddResponse.errorData },
				trace: [...queueAddResponse.trace, 'WorkflowSystemWorker - process - this.queueService.add'],
			});
		}

		if (executionStatus === 'success') return;

		const workflowExecutionCache = await this.workflowCacheService.getWorkflowExecutionCache(executionId);
		if (isError(workflowExecutionCache)) return;

		const triggerDetails = workflowExecutionCache.triggerDetails;
		if (!triggerDetails) return;

		const sendResponseResponse = await this.workflowResponderService.sendResponse({
			format: 'string',
			data: executionStatus === 'failed' ? userErrorMessage : response?.content,
			config: triggerDetails,
		});

		if (isError(sendResponseResponse)) {
			log('workflow', 'error', {
				message: sendResponseResponse.error,
				data: { executionId, executionStatus, ...sendResponseResponse.errorData },
				trace: [
					...sendResponseResponse.trace,
					'WorkflowSystemWorker - process - this.workflowResponderService.sendResponse',
				],
			});
		}
	}
}
