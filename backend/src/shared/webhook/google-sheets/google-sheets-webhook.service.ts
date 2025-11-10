import { Injectable } from '@nestjs/common';

import { log } from 'src/shared/logger/logger';

/**
 * @summary Google Sheets webhook service
 * @description Service for handling Google Sheets webhooks
 * @functions
 * - registerHandler
 * - unregisterHandler
 * - handleWebhook
 */
@Injectable()
export class GoogleSheetsWebhookService {
	constructor() {
		if (!GoogleSheetsWebhookService.instance) GoogleSheetsWebhookService.instance = this;
		return GoogleSheetsWebhookService.instance;
	}

	private static instance: GoogleSheetsWebhookService;
	private handlers = new Map<string, (payload: any) => Promise<void>>();

	/**
	 * Register a handler for a trigger node id
	 */
	registerHandler(triggerNodeId: string, handler: (payload: any) => Promise<void>) {
		this.handlers.set(triggerNodeId, handler);
	}

	/**
	 * Unregister a handler for a trigger node id
	 */
	unregisterHandler(triggerNodeId: string) {
		this.handlers.delete(triggerNodeId);
	}

	/**
	 * Handle a webhook
	 */
	async handleWebhook(triggerNodeId: string, payload: any) {
		const handler = this.handlers.get(triggerNodeId);
		if (!handler) {
			log('system', 'error', {
				message: 'No handler found for triggerNodeId!',
				data: { triggerNodeId },
				trace: ['GoogleSheetsWebhookService - handleWebhook - if (!handler)'],
			});
			return;
		}

		await handler(payload);
	}
}
