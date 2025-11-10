import { Injectable } from '@nestjs/common';
import { Telegraf } from 'telegraf';

import { DefaultReturnType } from 'src/shared/types/return.type';
import { returnErrorString } from 'src/shared/utils/return.util';

/**
 * @summary Telegram webhook service
 * @description Service for handling Telegram webhooks
 * @functions
 * - registerBot
 * - unregisterBot
 * - getBot
 * - handleUpdate
 */
@Injectable()
export class TelegramWebhookService {
	private bots: Map<string, Telegraf> = new Map();

	/**
	 * Register a bot
	 */
	registerBot(token: string, bot: Telegraf): DefaultReturnType<true> {
		try {
			this.bots.set(token, bot);
			return true;
		} catch (error) {
			return {
				userMessage: 'Error registering bot!',
				error: 'Error registering bot!',
				errorType: 'InternalServerErrorException',
				errorData: {
					token,
					bot,
					error: returnErrorString(error),
				},
				trace: ['TelegramWebhookService - registerBot - catch'],
			};
		}
	}

	/**
	 * Unregister a bot
	 */
	unregisterBot(token: string): DefaultReturnType<true> {
		try {
			this.bots.delete(token);
			return true;
		} catch (error) {
			return {
				userMessage: 'Error unregistering bot!',
				error: 'Error unregistering bot!',
				errorType: 'InternalServerErrorException',
				errorData: {
					token,
					error: returnErrorString(error),
				},
				trace: ['TelegramWebhookService - unregisterBot - catch'],
			};
		}
	}

	/**
	 * Get a bot
	 */
	getBot(token: string): DefaultReturnType<Telegraf> {
		try {
			const bot = this.bots.get(token);
			if (!bot) {
				return {
					userMessage: 'Bot not found!',
					error: 'Bot not found!',
					errorType: 'InternalServerErrorException',
					errorData: { token },
					trace: ['TelegramWebhookService - getBot - if (!bot)'],
				};
			}

			return bot;
		} catch (error) {
			return {
				userMessage: 'Error getting bot!',
				error: 'Error getting bot!',
				errorType: 'InternalServerErrorException',
				errorData: {
					token,
					error: returnErrorString(error),
				},
				trace: ['TelegramWebhookService - getBot - catch'],
			};
		}
	}

	/**
	 * Handle a Telegram update
	 */
	async handleUpdate(token: string, update: any): Promise<DefaultReturnType<true>> {
		try {
			const bot = this.bots.get(token);
			if (bot) {
				await bot.handleUpdate(update);
				return true;
			}

			return {
				userMessage: 'No bot found!',
				error: 'No bot found!',
				errorType: 'InternalServerErrorException',
				errorData: { token },
				trace: ['TelegramWebhookService - handleUpdate - if (bot) else'],
			};
		} catch (error) {
			return {
				userMessage: 'Error handling update!',
				error: 'Error handling update!',
				errorType: 'InternalServerErrorException',
				errorData: {
					token,
					update,
					error: returnErrorString(error),
				},
				trace: ['TelegramWebhookService - handleUpdate - catch'],
			};
		}
	}
}
