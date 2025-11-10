import { Injectable } from '@nestjs/common';

import { ResponderNodeConfigType, ResponderDataFormatType } from '../workflow-system.type';
import { loadNodeClass } from '../workflow-system.util';
import { InteractService } from 'src/interact/interact.service';
import ResponderBaseNode from '../nodes/base-node/responder/ResponderBaseNode';
import InteractResponderNode from '../nodes/responders/interact/Interact';
import { DefaultReturnType } from 'src/shared/types/return.type';
import { returnErrorString } from 'src/shared/utils/return.util';
import { isError } from 'src/shared/utils/error.util';
import WebhookResponderNode from '../nodes/responders/webhook/Webhook';
import { DelayedResponseService } from 'src/shared/delayed-response/delayed-response.service';

/**
 * @summary Workflow responder service
 * @description Service for handling workflow responder operations
 * @functions
 * - sendResponse
 *
 * @private
 * - getResponder
 */
@Injectable()
export class WorkflowResponderService {
	constructor(
		private readonly interactService: InteractService,
		private readonly delayedResponseService: DelayedResponseService,
	) {}

	/**
	 * Send response
	 */
	async sendResponse(props: {
		format: ResponderDataFormatType;
		data: any;
		config: ResponderNodeConfigType;
	}): Promise<DefaultReturnType<true>> {
		try {
			const { format, data, config } = props;

			if (config.type === 'cron') return true;

			const responder = await this.getResponder(config);
			if (isError(responder)) {
				return {
					...responder,
					trace: [...responder.trace, 'WorkflowResponderService_sendResponse - getResponder'],
				};
			}

			const formattedData = typeof data === 'string' ? { defaultData: data } : data;

			if (responder instanceof InteractResponderNode) {
				formattedData.addMessage = this.interactService.addMessage.bind(this.interactService);
			} else if (responder instanceof WebhookResponderNode) {
				formattedData.sendResponse = this.delayedResponseService.sendResponse.bind(this.delayedResponseService);
			}

			const result = await responder.execute({
				format,
				data: formattedData,
				config,
			});
			if (isError(result)) {
				return {
					...result,
					trace: [...result.trace, 'WorkflowResponderService_sendResponse - responder.execute'],
				};
			}

			return true;
		} catch (error) {
			return {
				userMessage: 'Error sending response!',
				error: 'Error sending response!',
				errorType: 'InternalServerErrorException',
				errorData: {
					props,
					error: returnErrorString(error),
				},
				trace: ['WorkflowResponderService -sendResponse - catch'],
			};
		}
	}

	/**
	 * Get responder
	 */
	private async getResponder(config: ResponderNodeConfigType): Promise<DefaultReturnType<ResponderBaseNode>> {
		const triggerInstance = await loadNodeClass({ type: `${config.type}-responder`, category: 'responder' });

		if (isError(triggerInstance)) {
			return {
				...triggerInstance,
				trace: [...triggerInstance.trace, 'WorkflowResponderService - getResponder - loadNodeClass'],
			};
		}

		return triggerInstance;
	}
}
