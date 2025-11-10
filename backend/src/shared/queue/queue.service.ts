import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { JobsOptions, Queue } from 'bullmq';

import { QUEUE } from 'src/shared/queue/queue.constant';
import { DefaultReturnType } from '../types/return.type';
import { returnErrorString } from '../utils/return.util';
import { isError } from '../utils/error.util';

/**
 * @summary Queue service
 * @description Service for queue operations
 * @functions
 * - add
 * - getQueue
 */
@Injectable()
export class QueueService {
	constructor(
		@InjectQueue(QUEUE.WORKFLOW_SYSTEM_QUEUE) private readonly workflowSystemQueue: Queue,
		@InjectQueue(QUEUE.WORKFLOW_SAVE_TO_DB_QUEUE) private readonly workflowSaveToDbQueue: Queue,
	) {
		this.queueMap = {
			[QUEUE.WORKFLOW_SYSTEM_QUEUE]: this.workflowSystemQueue,
			[QUEUE.WORKFLOW_SAVE_TO_DB_QUEUE]: this.workflowSaveToDbQueue,
		};
	}

	private readonly queueMap: Record<string, Queue>;

	/**
	 * Add job to queue
	 */
	async add(props: {
		queueName: string;
		key: string;
		data: any;
		options?: JobsOptions;
	}): Promise<DefaultReturnType<true>> {
		try {
			const { queueName, key, data, options = { removeOnComplete: true } } = props;
			const queueData = this.getQueue(queueName);
			if (isError(queueData)) return queueData;

			const response = await queueData.add(key, data, options);
			if (!response) {
				return {
					userMessage: 'Internal server error!',
					error: `Failed to add job to queue ${queueName}!`,
					errorType: 'InternalServerErrorException',
					errorData: { props },
					trace: ['QueueService - add - this.queue.add'],
				};
			}

			return true;
		} catch (error) {
			return {
				userMessage: 'Internal server error!',
				error: `Error adding job to queue!`,
				errorType: 'InternalServerErrorException',
				errorData: {
					props,
					error: returnErrorString(error),
				},
				trace: ['QueueService - add - catch'],
			};
		}
	}

	/**
	 * Get queue
	 */
	private getQueue(queueName: string): DefaultReturnType<Queue> {
		try {
			const queue = this.queueMap[queueName];
			if (!queue) {
				return {
					userMessage: 'Internal server error!',
					error: `Queue ${queueName} not found!`,
					errorType: 'NotFoundException',
					errorData: { queueName },
					trace: ['QueueService - getQueue - this.queueMap[queueName]'],
				};
			}

			return queue;
		} catch (error) {
			return {
				userMessage: 'Internal server error!',
				error: `Error getting queue ${queueName}!`,
				errorType: 'InternalServerErrorException',
				errorData: {
					queueName,
					error: returnErrorString(error),
				},
				trace: ['QueueService - getQueue - catch'],
			};
		}
	}
}
