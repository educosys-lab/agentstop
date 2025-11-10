import { Injectable, Scope } from '@nestjs/common';

import { DefaultReturnType } from 'src/shared/types/return.type';
import { isError } from 'src/shared/utils/error.util';
import { WorkflowPrivateService } from 'src/workflow/workflow.private';

@Injectable({ scope: Scope.DEFAULT })
export class WhatsAppWebhookService {
	private handlers: Map<string, (payload: any) => Promise<void>> = new Map();

	constructor(private readonly workflowPrivateService: WorkflowPrivateService) {}

	registerHandler(triggerNodeId: string, handler: (payload: any) => Promise<void>) {
		this.handlers.set(triggerNodeId, handler);
	}

	clearHandlers() {
		this.handlers.clear();
	}

	async handleWebhook(
		triggerNodeId: string,
		payload: any,
		verifyToken?: string,
		challenge?: string,
		workflowId?: string,
	): Promise<DefaultReturnType<string | true>> {
		if (verifyToken && challenge && workflowId) {
			const configuredVerifyToken = await this.getVerifyToken(workflowId, triggerNodeId);
			if (!configuredVerifyToken) {
				return {
					userMessage: 'Verification failed',
					error: 'No configured verify token found',
					errorType: 'BadRequestException',
					errorData: { workflowId, triggerNodeId, verifyToken },
					trace: ['WhatsAppWebhookService - handleWebhook - verify token'],
				};
			}

			if (verifyToken === configuredVerifyToken) return challenge;

			return {
				userMessage: 'Invalid verify token',
				error: 'Invalid verify token',
				errorType: 'BadRequestException',
				errorData: { workflowId, triggerNodeId, verifyToken },
				trace: ['WhatsAppWebhookService - handleWebhook - verify token'],
			};
		}

		if (!payload || Object.keys(payload).length === 0) {
			return {
				userMessage: 'No payload provided',
				error: 'No payload provided',
				errorType: 'BadRequestException',
				errorData: { triggerNodeId },
				trace: ['WhatsAppWebhookService - handleWebhook - no payload'],
			};
		}

		const handler = this.handlers.get(triggerNodeId);
		if (!handler) {
			return {
				userMessage: `No handler found for triggerNodeId: ${triggerNodeId}`,
				error: `No handler found for triggerNodeId: ${triggerNodeId}`,
				errorType: 'BadRequestException',
				errorData: { triggerNodeId },
				trace: ['WhatsAppWebhookService - handleWebhook - no handler'],
			};
		}

		try {
			await handler(payload);
			return true;
		} catch (error) {
			return {
				userMessage: `Failed to handle WhatsApp webhook: ${error.message}`,
				error: `Failed to handle WhatsApp webhook: ${error.message}`,
				errorType: 'InternalServerErrorException',
				errorData: { error: error.message, stack: error.stack },
				trace: ['WhatsAppWebhookService - handleWebhook - handler'],
			};
		}
	}

	private async getVerifyToken(workflowId: string, triggerNodeId: string): Promise<string | null> {
		try {
			const workflow = await this.workflowPrivateService.getWorkflowInternal(workflowId);
			if (isError(workflow) || !workflow) return null;

			const verifyToken = workflow.config?.[triggerNodeId]?.verify_token;
			if (verifyToken) return verifyToken;

			return null;
		} catch {
			return null;
		}
	}
}
