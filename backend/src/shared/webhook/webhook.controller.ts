import { Controller, Post, Req, Headers, Param, Body, Get, Query, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

import { Public } from 'src/auth/public.decorator';
import { TelegramWebhookService } from './telegram/telegram-webhook.service';
import { GoogleSheetsWebhookService } from './google-sheets/google-sheets-webhook.service';
import { log } from '../logger/logger';
import { isError } from '../utils/error.util';
import { WhatsAppWebhookService } from './whatsapp/whatsapp-webhook.service';
import { WhatsAppToolWebhookService } from './whatsapp/whatsapp-tool-webhook.service';
import { DefaultReturnType } from '../types/return.type';
import { WebhookTriggerService } from './webhook-trigger/webhook-trigger.service';
import { DelayedResponseService } from '../delayed-response/delayed-response.service';
import { returnErrorString } from '../utils/return.util';

/**
 * @summary Webhook controller
 * @description Controller for handling webhooks
 * @routes
 * - /webhook/telegram/:token - POST - Public
 * - /webhook/google-sheets/:workflowId/:triggerNodeId - POST - Public
 */
@Controller('/webhook')
export class WebhookController {
	constructor(
		private readonly telegramWebhookService: TelegramWebhookService,
		private readonly googleSheetsWebhookService: GoogleSheetsWebhookService,
		private readonly whatsappWebhookService: WhatsAppWebhookService,
		private readonly whatsappToolWebhookService: WhatsAppToolWebhookService,
		private readonly webhookTriggerService: WebhookTriggerService,
		private readonly delayedResponseService: DelayedResponseService,
	) {}

	/**
	 * ✅ Basic GET endpoint for testing ngrok connectivity
	 * Example: GET https://<ngrok-url>/webhook/test
	 */
	@Get('test')
	testWebhook(@Res() res: Response) {
		const message = `✅ Ngrok tunnel is working!
	Request received at ${new Date().toISOString()}`;
		res.type('text/plain').send(message);
	}

	/**
	 * Handle a Google Sheets webhook
	 */
	@Public()
	@Post('/google-sheets/:workflowId/:triggerNodeId')
	async handleGoogleSheetsWebhook(
		// @Param('workflowId') workflowId: string,
		@Param('triggerNodeId') triggerNodeId: string,
		@Body() payload: any,
	): Promise<true> {
		await this.googleSheetsWebhookService.handleWebhook(triggerNodeId, payload);
		return true;
	}

	/**
	 * Handle a Telegram update
	 */
	@Public()
	@Post('/telegram/:token')
	async handleTelegramUpdate(@Req() req: Request): Promise<boolean> {
		const response = await this.telegramWebhookService.handleUpdate(req.params.token, req.body);
		if (isError(response)) {
			log('system', 'error', {
				message: response.userMessage,
				data: response.errorData,
				trace: [
					...response.trace,
					'WebhookController - handleTelegramUpdate - this.telegramWebhookService.handleUpdate',
				],
			});
			return false;
		}

		return response;
	}

	/**
	 * Handle a WhatsApp webhook
	 */
	@Public()
	@Get('/whatsapp/:workflowId/:triggerNodeId')
	async handleWhatsAppWebhookGet(
		@Param('workflowId') workflowId: string,
		@Param('triggerNodeId') triggerNodeId: string,
		@Query() query: any,
	): Promise<string> {
		const verifyToken = query['hub.verify_token'];
		const challenge = query['hub.challenge'];

		if (!verifyToken || !challenge) {
			log('system', 'error', {
				message: 'Missing verify_token or challenge',
				data: { workflowId, triggerNodeId },
				trace: ['WebhookController - handleWhatsAppWebhookGet'],
			});
			throw new Error('Missing verify_token or challenge');
		}

		const response = await this.whatsappWebhookService.handleWebhook(
			triggerNodeId,
			{},
			verifyToken,
			challenge,
			workflowId,
		);
		if (isError(response)) {
			log('system', 'error', {
				message: response.userMessage,
				data: response.errorData,
				trace: ['WebhookController - handleWhatsAppWebhookGet'],
			});
			throw new Error(response.userMessage);
		}

		return response as string;
	}

	@Public()
	@Post('/whatsapp/:workflowId/:triggerNodeId')
	async handleWhatsAppWebhookPost(
		@Param('workflowId') workflowId: string,
		@Param('triggerNodeId') triggerNodeId: string,
		@Body() payload: any,
	): Promise<true> {
		const response = await this.whatsappWebhookService.handleWebhook(
			triggerNodeId,
			payload,
			undefined,
			undefined,
			workflowId,
		);
		if (isError(response)) {
			log('system', 'error', {
				message: response.userMessage,
				data: response.errorData,
				trace: ['WebhookController - handleWhatsAppWebhookPost'],
			});
			throw new Error(response.userMessage);
		}

		return response as true;
	}

	/**
	 * Handle a WhatsApp Tool webhook
	 */
	@Public()
	@Get('/whatsapp-tool/:workflowId/:nodeId')
	async handleWhatsAppToolWebhookGet(
		@Param('workflowId') workflowId: string,
		@Param('nodeId') nodeId: string,
		@Query() query: any,
	): Promise<string> {
		const mode = query['hub.mode'];
		const verifyToken = query['hub.verify_token'];
		const challenge = query['hub.challenge'];

		const response = await this.whatsappToolWebhookService.handleWebhookGet(
			workflowId,
			nodeId,
			mode,
			verifyToken,
			challenge,
		);
		if (isError(response)) {
			log('system', 'error', {
				message: response.userMessage,
				data: response.errorData,
				trace: ['WebhookController - handleWhatsAppToolWebhookGet'],
			});
			throw new Error(response.userMessage);
		}

		return response;
	}

	@Public()
	@Post('/whatsapp-tool/:workflowId/:nodeId')
	async handleWhatsAppToolWebhookPost(
		@Param('workflowId') workflowId: string,
		@Param('nodeId') nodeId: string,
		@Body() payload: any,
	): Promise<{ status: string }> {
		const response = await this.whatsappToolWebhookService.handleWebhookPost(workflowId, nodeId, payload);
		if (isError(response)) {
			log('system', 'error', {
				message: response.userMessage,
				data: response.errorData,
				trace: ['WebhookController - handleWhatsAppToolWebhookPost'],
			});
			throw new Error(response.userMessage);
		}

		return response as { status: string };
	}

	/**
	 * Handle sending a WhatsApp message
	 */
	@Public()
	@Post('/whatsapp-tool/:workflowId/:nodeId/send-message')
	async handleSendMessage(
		@Param('workflowId') workflowId: string,
		@Param('nodeId') nodeId: string,
		@Body() payload: { receiverMobile: string; messageContent: string; userId: string },
	): Promise<DefaultReturnType<{ messageId: string }>> {
		const response = await this.whatsappToolWebhookService.sendMessage(
			payload.receiverMobile,
			payload.messageContent,
			payload.userId,
			workflowId,
			nodeId,
		);
		if (isError(response)) {
			log('system', 'error', {
				message: response.userMessage,
				data: { ...response.errorData, workflowId, nodeId },
				trace: ['WebhookController - handleSendMessage'],
			});
			throw new Error(response.userMessage);
		}
		return response;
	}

	/**
	 * Handle a webhook
	 */
	@Public()
	@Post('/:workflowId')
	async handleWebhook(
		@Param('workflowId') workflowId: string,
		@Body() payload: any,
		@Res() response: Response,
		@Req() request: Request,
	): Promise<void> {
		/** Generate a unique request ID */
		const requestId = uuidv4();

		/** Store the response object for later use */
		const storeResponseResult = this.delayedResponseService.storeResponse({ requestId, response });
		if (isError(storeResponseResult)) {
			log('system', 'error', {
				message: storeResponseResult.userMessage,
				data: { workflowId, requestId, ...storeResponseResult.errorData },
				trace: [...storeResponseResult.trace, 'WebhookController - handleWebhook - storeResponse'],
			});
			response.status(500).json({ error: 'Internal server error' });
			return;
		}

		const headers = request.headers;
		/** Process the webhook asynchronously */
		this.webhookTriggerService.handleWebhook({ requestId, workflowId, payload, request }).catch((error) => {
			console.log('headers received in handleWebhook-webhook-controller:', headers);
			console.log('Payload received in handleWebhook:', payload);
			log('system', 'error', {
				message: 'Error processing webhook',
				data: { workflowId, requestId, error: returnErrorString(error) },
				trace: ['WebhookController - handleWebhook - catch'],
			});

			/** Send error response if still possible */
			if (this.delayedResponseService.hasResponse(requestId)) {
				this.delayedResponseService.sendResponse({
					requestId,
					data: { error: 'Internal server error' },
					statusCode: 500,
				});
			}
		});
	}
}
