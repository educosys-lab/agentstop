import { Injectable } from '@nestjs/common';

import { isError } from 'src/shared/utils/error.util';
import { WorkflowSystemService } from 'src/workflow-system/services/system.service';
import { WorkflowPrivateService } from 'src/workflow/workflow.private';
import { DelayedResponseService } from '../../delayed-response/delayed-response.service';
import { log } from 'src/shared/logger/logger';
import { returnErrorString } from 'src/shared/utils/return.util';

/**
 * @summary Webhook trigger service
 * @description Service for handling webhook triggers
 * @functions
 * - handleWebhook
 */
@Injectable()
export class WebhookTriggerService {
	constructor(
		private readonly workflowPrivateService: WorkflowPrivateService,
		private readonly workflowSystemService: WorkflowSystemService,
		private readonly delayedResponseService: DelayedResponseService,
	) {}

	/**
	 * Handle a webhook
	 */
	async handleWebhook({
		requestId,
		workflowId,
		payload,
		request,
	}: {
		requestId: string;
		workflowId: string;
		payload: any;
		request: any;
	}) {
		console.log('headers received in handleWebhook-webhook-trigger-service:', request.headers);
		console.log('Payload received in handleWebhook-webhook-trigger-service:', payload);
		console.log('Request ID:', requestId);
		console.log('Workflow ID:', workflowId);
		try {
			const workflow = await this.workflowPrivateService.getWorkflowInternal(workflowId);
			if (isError(workflow)) {
				const errorResponse = {
					...workflow,
					trace: [
						...workflow.trace,
						'WebhookTriggerService - handleWebhook - this.workflowPrivateService.getWorkflowInternal',
					],
				};

				/** Send error response if requestId is provided */
				if (requestId && this.delayedResponseService.hasResponse(requestId)) {
					this.delayedResponseService.sendResponse({
						requestId,
						data: { error: errorResponse.userMessage },
						statusCode: 400,
					});
				}

				return errorResponse;
			}

			let formattedContent: string;
			try {
				if (payload.content) {
					const contentStr = payload.content
						.replace(/([{,]\s*)([a-zA-Z0-9_]+)(\s*:)/g, '$1"$2"$3')
						.replace(/'([^']*)'/g, '"$1"');
					const contentObj = JSON.parse(contentStr);
					if (contentObj.number && !contentObj.number.startsWith('+')) {
						contentObj.number = `+91${contentObj.number}`;
					}
					formattedContent = JSON.stringify(contentObj);
				} else {
					const contentObj = {
						...payload,
						number:
							payload.number && !payload.number.startsWith('+') ? `+91${payload.number}` : payload.number,
					};
					formattedContent = JSON.stringify(contentObj);
				}
			} catch (parseError) {
				console.log('Error parsing payload', { parseError, payload });
				throw new Error('Invalid payload format');
			}

			const transformedPayload = {
				content: formattedContent,
			};

			const triggerWorkflowResponse = await this.workflowSystemService.triggerWorkflow({
				userId: workflow.createdBy,
				workflowId: workflowId,
				data: transformedPayload.content,
				format: 'string',
				sourceData: { type: 'webhook', requestId },
			});
			if (isError(triggerWorkflowResponse)) {
				const errorResponse = {
					...triggerWorkflowResponse,
					trace: [
						...triggerWorkflowResponse.trace,
						'WebhookTriggerService - handleWebhook - this.workflowSystemService.triggerWorkflow',
					],
				};

				/** Send error response if requestId is provided */
				if (requestId && this.delayedResponseService.hasResponse(requestId)) {
					this.delayedResponseService.sendResponse({
						requestId,
						data: { error: errorResponse.userMessage },
						statusCode: 500,
					});
				}

				return errorResponse;
			}

			// // Send success response if requestId is provided
			// if (requestId && this.delayedResponseService.hasResponse(requestId)) {
			// 	this.delayedResponseService.sendResponse(
			// 		requestId,
			// 		{
			// 			message: 'Webhook processed successfully',
			// 			success: true,
			// 			workflowId: workflowId,
			// 		},
			// 		200,
			// 	);
			// }

			return true;
		} catch (error) {
			log('system', 'error', {
				message: 'Unexpected error in webhook processing',
				data: { workflowId, requestId, error: returnErrorString(error) },
				trace: ['WebhookTriggerService - handleWebhook - catch'],
			});

			/** Send error response if requestId is provided */
			if (requestId && this.delayedResponseService.hasResponse(requestId)) {
				this.delayedResponseService.sendResponse({
					requestId,
					data: { error: 'Internal server error' },
					statusCode: 500,
				});
			}

			return {
				userMessage: 'Internal server error!',
				error: 'Internal server error!',
				errorType: 'InternalServerErrorException',
				errorData: {
					workflowId,
					requestId,
					error: returnErrorString(error),
				},
				trace: ['WebhookTriggerService - handleWebhook - catch'],
			};
		}
	}
}
