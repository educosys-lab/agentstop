import { Injectable } from '@nestjs/common';

import { loadNodeClass } from '../workflow-system.util';
import { NodeType } from 'src/workflow/workflow.type';
import { NodeVariantType, TriggerCallbackType } from '../workflow-system.type';
import { TelegramWebhookService } from '../../shared/webhook/telegram/telegram-webhook.service';
import { discordStopListener } from '../nodes/triggers/discord/stopListener';
import { cronStopListener } from '../nodes/triggers/cron/stopListener';
import { googleSheetsStopListener } from '../nodes/triggers/google-sheets/stopListener';
import { DefaultReturnType } from 'src/shared/types/return.type';
import { returnErrorString } from 'src/shared/utils/return.util';
import { isError } from 'src/shared/utils/error.util';
import { whatsappStopListener } from '../nodes/triggers/whatsapp/stopListener';
import { WhatsAppWebhookService } from 'src/shared/webhook/whatsapp/whatsapp-webhook.service';

/**
 * @summary Workflow listeners service
 * @description Service for handling workflow listeners
 * @functions
 * - startListener
 * - deleteListener
 *
 * @private
 * - storeListener
 */
@Injectable()
export class WorkflowListenersService {
	constructor(
		private readonly telegramWebhookService: TelegramWebhookService,
		private readonly whatsappWebhookService: WhatsAppWebhookService,
	) {}

	// Store listeners for non-Telegram triggers
	private listeners: Map<string, any> = new Map();

	/**
	 * Start listener
	 */
	async startListener(props: {
		userId: string;
		workflowId: string;
		triggerNodes: NodeType[];
		config: { [nodeId: string]: any };
		triggerCallback: TriggerCallbackType;
	}): Promise<DefaultReturnType<true>> {
		const { userId, workflowId, triggerNodes, config, triggerCallback } = props;

		for (const triggerNode of triggerNodes) {
			if (triggerNode.type === 'telegram-trigger') {
				const bot = this.telegramWebhookService.getBot(config.accessToken);
				if (!isError(bot)) continue;
			}

			const nodeInstance = await loadNodeClass({ type: triggerNode.type, category: 'trigger' });
			if (isError(nodeInstance)) {
				return {
					...nodeInstance,
					trace: [...nodeInstance.trace, 'WorkflowListenersService - loadNodeClass'],
				};
			}

			const response = await nodeInstance.startListener({
				userId,
				workflowId,
				triggerNodeId: triggerNode.id,
				config: config[triggerNode.id] || {},
				triggerCallback,
				storeListener: this.storeListener.bind(this),
			});
			if (isError(response)) {
				return {
					...response,
					trace: [...response.trace, 'WorkflowListenersService - nodeInstance.startListener'],
				};
			}

			if (triggerNode.type === 'whatsapp-trigger') {
				const handleWebhook = async (payload: any) => {
					const isStatusUpdate = payload?.entry?.[0]?.changes?.[0]?.value?.statuses;
					if (isStatusUpdate) return;

					const message = payload?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
					const message_text = message?.text?.body || '';

					const recipient_phone_number =
						payload?.entry?.[0]?.changes?.[0]?.value?.contacts?.[0]?.wa_id ||
						payload?.entry?.[0]?.changes?.[0]?.value?.statuses?.[0]?.recipient_id ||
						'';

					const configData = config[triggerNode.id] || {};
					const { whatsapp_access_token, phone_number_id } = configData;

					const webhookUrl = `${process.env.BACKEND_URL}/webhook/whatsapp/${workflowId}/${triggerNode.id}`;

					await triggerCallback({
						userId,
						workflowId,
						data: message_text,
						format: 'string',
						triggerDetails: {
							type: 'whatsapp',
							nodeId: triggerNode.id,
							access_token: whatsapp_access_token,
							phone_number_id,
							webhook_url: webhookUrl,
							recipient_phone_number,
						},
					});
				};

				this.whatsappWebhookService.clearHandlers();
				this.whatsappWebhookService.registerHandler(triggerNode.id, handleWebhook);
			}
		}

		return true;
	}

	/**
	 * Delete listener
	 */
	async deleteListener(props: { type: NodeVariantType; uniqueKey: string }): Promise<DefaultReturnType<true>> {
		try {
			const { type, uniqueKey } = props;

			const bot =
				type === 'telegram-trigger'
					? this.telegramWebhookService.getBot(uniqueKey)
					: this.listeners.get(uniqueKey);
			if (!bot) return true;

			if (type === 'discord-trigger') {
				await discordStopListener({ listener: bot });
			} else if (type === 'slack-trigger') {
				bot.stop();
			} else if (type === 'cron-trigger') {
				await cronStopListener({ listener: bot, triggerNodeId: uniqueKey });
			} else if (type === 'google-sheets-trigger') {
				await googleSheetsStopListener({ listener: bot });
			} else if (type === 'telegram-trigger') {
				await bot.telegram.deleteWebhook();
				this.telegramWebhookService.unregisterBot(uniqueKey);
			} else if (type === 'whatsapp-trigger') {
				await whatsappStopListener({ listener: bot });
			} else {
				this.listeners.delete(uniqueKey);
			}

			return true;
		} catch (error) {
			return {
				userMessage: 'Error deleting listener!',
				error: 'Error deleting listener!',
				errorType: 'InternalServerErrorException',
				errorData: {
					props,
					error: returnErrorString(error),
				},
				trace: ['WorkflowListenersService - deleteListener - catch'],
			};
		}
	}

	/**
	 * Store listener
	 */
	private async storeListener(props: {
		triggerType: string;
		listener: any;
		uniqueKey: string;
	}): Promise<DefaultReturnType<true>> {
		try {
			const { triggerType, listener, uniqueKey } = props;

			if (triggerType === 'telegram') {
				this.telegramWebhookService.registerBot(uniqueKey, listener);
			} else {
				this.listeners.set(uniqueKey, listener);
			}

			return true;
		} catch (error) {
			return {
				userMessage: 'Error storing listener!',
				error: 'Error storing listener!',
				errorType: 'InternalServerErrorException',
				errorData: {
					props,
					error: returnErrorString(error),
				},
				trace: ['WorkflowListenersService - storeListener - catch'],
			};
		}
	}
}
