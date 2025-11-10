import { Injectable } from '@nestjs/common';

import { log } from 'src/shared/logger/logger';
import { WorkflowCacheService } from './cache.service';
import { loadNodeClass } from '../workflow-system.util';
import GeneralBaseNode from '../nodes/base-node/general/GeneralBaseNode';
import { WorkflowResponderService } from './responder.service';
import { isAccessTokenValid, refreshAccessToken } from 'src/shared/utils/google.util';
import { WorkflowService } from 'src/workflow/workflow.service';
import ResponderBaseNode from '../nodes/base-node/responder/ResponderBaseNode';
import { ConnectionMapType, GeneralNodeReturnType, NodeMapType } from '../workflow-system.type';
import TriggerBaseNode from '../nodes/base-node/trigger/TriggerBaseNode';
import ToolBaseNode from '../nodes/base-node/tool/ToolBaseNode';
import { DefaultReturnType } from 'src/shared/types/return.type';
import { isObject } from 'src/shared/utils/object.util';
import { returnErrorString } from 'src/shared/utils/return.util';
import { isError } from 'src/shared/utils/error.util';

type OnVisitNodePropsType = {
	nodeId: string;
	nodeData: NodeMapType[string];
	toolNodes: { [toolType: string]: Record<string, any> };
	nextNodeSchema: { id: string; type: string; props: any }[] | undefined;
	nextNodeAiPrompt: string | undefined;
};

/**
 * @summary Workflow executor service
 * @description Service for executing workflows
 * @functions
 * - executeWorkflow
 * - traverseWorkflow
 *
 * @private
 * - callExecute
 * - checkGoogleToken
 * - workflowReportUpdate
 */
@Injectable()
export class WorkflowExecutorService {
	constructor(
		private readonly workflowService: WorkflowService,
		private readonly workflowCacheService: WorkflowCacheService,
		private readonly workflowResponderService: WorkflowResponderService,
	) {}

	/**
	 * Execute workflow
	 */
	async executeWorkflow(
		executionId: string,
	): Promise<DefaultReturnType<{ status: GeneralNodeReturnType['status']; content?: string }>> {
		const workflowExecutionCache = await this.workflowCacheService.getWorkflowExecutionCache(executionId);
		if (isError(workflowExecutionCache)) {
			return {
				...workflowExecutionCache,
				trace: [
					'WorkflowExecutorService - executeWorkflow - this.workflowCacheService.getWorkflowExecutionCache',
				],
			};
		}

		try {
			const triggerDetails = workflowExecutionCache.triggerDetails;
			if (!triggerDetails) {
				return {
					userMessage: 'Missing trigger details!',
					error: 'Missing trigger details!',
					errorType: 'BadRequestException',
					errorData: { executionId },
					trace: ['WorkflowExecutorService - executeWorkflow - if (!triggerDetails)'],
				};
			}

			if (workflowExecutionCache.generalSettings.showResultFromAllNodes && triggerDetails.type !== 'webhook') {
				const response = await this.workflowResponderService.sendResponse({
					format: 'string',
					data: 'Mission Triggered',
					config: triggerDetails,
				});
				if (isError(response)) {
					return {
						...response,
						trace: [
							...response.trace,
							'WorkflowExecutorService - executeWorkflow - this.workflowResponderService.sendResponse',
						],
					};
				}
			}

			const result = await this.traverseWorkflow({
				startNodeIds: [workflowExecutionCache.triggerDetails.nodeId],
				connectionMap: workflowExecutionCache.connectionMap,
				nodeMap: workflowExecutionCache.nodeMap,
				onVisitNode: async ({
					nodeId,
					nodeData,
					toolNodes,
					nextNodeSchema,
					nextNodeAiPrompt,
				}: OnVisitNodePropsType): Promise<
					DefaultReturnType<{ status: GeneralNodeReturnType['status']; content?: string }>
				> => {
					const nodeInstance = await loadNodeClass({ type: nodeData.type, category: 'all' });
					if (isError(nodeInstance)) {
						return {
							userMessage: 'Node instance not found!',
							error: 'Node instance not found!',
							errorType: 'NotFoundException',
							errorData: { executionId, nodeId, nodeType: nodeData.type },
							trace: ['WorkflowExecutorService - traverseWorkflow - this.loadNodeClass'],
						};
					}

					const executeResponse = await this.callExecute({
						executionId,
						nodeInstance,
						nodeId,
						toolNodes,
						nextNodeSchema,
						nextNodeAiPrompt,
					});
					if (isError(executeResponse)) {
						return {
							...executeResponse,
							trace: [
								...executeResponse.trace,
								'WorkflowExecutorService - traverseWorkflow - this.callExecute',
							],
						};
					}

					return executeResponse;
				},
			});

			return result;
		} catch (error) {
			return {
				userMessage: 'Error executing workflow',
				error: 'Error executing workflow',
				errorType: 'InternalServerErrorException',
				errorData: {
					executionId,
					error: returnErrorString(error),
				},
				trace: ['WorkflowExecutorService - executeWorkflow - catch'],
			};
		}
	}

	/**
	 * Traverse workflow
	 */
	async traverseWorkflow(props: {
		startNodeIds: string[];
		connectionMap: ConnectionMapType;
		nodeMap: NodeMapType;
		onVisitNode: ({
			nodeId,
			nodeData,
			toolNodes,
			nextNodeSchema,
			nextNodeAiPrompt,
		}: OnVisitNodePropsType) => Promise<
			DefaultReturnType<{ status: GeneralNodeReturnType['status']; content?: string }>
		>;
	}): Promise<DefaultReturnType<{ status: GeneralNodeReturnType['status']; content?: string }>> {
		let activeError: DefaultReturnType<true> | null = null;
		let executionResult: { status: GeneralNodeReturnType['status']; content?: string } | null = null;

		try {
			const { startNodeIds, connectionMap, nodeMap, onVisitNode } = props;

			const visited = new Set<string>();
			let currentLevel = [...startNodeIds];

			while (currentLevel.length > 0) {
				const nextLevel: string[] = [];

				for (const nodeId of currentLevel) {
					if (visited.has(nodeId)) continue;
					visited.add(nodeId);

					const nodeData = nodeMap[nodeId];
					if (!nodeData) throw `Node not found in nodeMap: ${nodeId}`;

					const connection = connectionMap[nodeId] || {
						previousNodeIds: [],
						nextNodeIds: [],
						toolNodeIds: [],
					};

					nextLevel.push(...connection.nextNodeIds.filter((id) => !visited.has(id)));

					if (['Trigger', 'Tool', 'System'].includes(nodeData.category)) {
						continue;
					}

					const toolNodes: { [toolType: string]: Record<string, any> } = {};

					for (const toolId of connection.toolNodeIds) {
						const toolNode = nodeMap[toolId];
						if (!toolNode) throw `Node data not found (${toolId})`;
						toolNodes[toolNode.type] = toolNode.config;
					}

					const nextNodeSchema: any = connection.nextNodeIds
						.map((nextId) => {
							const nextNode = nodeMap[nextId];
							return nextNode && nextNode.aiGenerateProps
								? { id: nextId, type: nextNode.type, props: nextNode.aiGenerateProps }
								: null;
						})
						.filter((node) => node !== null);

					const nextNodeAiPrompt = connection.nextNodeIds.reduce((prompt, nextId) => {
						const nextNode = nodeMap[nextId];
						if (nextNode && nextNode.aiPrompt) prompt = `${prompt}\n\n${nextNode.aiPrompt}`;
						return prompt;
					}, '');

					const result = await onVisitNode({
						nodeId,
						nodeData,
						toolNodes,
						nextNodeSchema,
						nextNodeAiPrompt,
					});
					if (isError(result)) {
						activeError = result;
						throw 'Error in onVisitNode!';
					}

					if (result.status === 'hold') {
						executionResult = result;
						throw 'Hold response!';
					}
				}

				currentLevel = nextLevel;
			}

			return { status: 'success' };
		} catch (error) {
			if (isError(activeError)) {
				return {
					...activeError,
					trace: [...activeError.trace, 'WorkflowExecutorService - traverseWorkflow - onVisitNode'],
				};
			}

			if (executionResult) return executionResult;

			return {
				userMessage: 'Error in onVisitNode!',
				error: 'Error in onVisitNode!',
				errorType: 'InternalServerErrorException',
				errorData: {
					error: returnErrorString(error),
				},
				trace: ['WorkflowExecutorService - traverseWorkflow - onVisitNode'],
			};
		}
	}

	/**
	 * Call execute
	 */
	private async callExecute(props: {
		executionId: string;
		nodeInstance: TriggerBaseNode | ResponderBaseNode | GeneralBaseNode | ToolBaseNode;
		nodeId: string;
		toolNodes: OnVisitNodePropsType['toolNodes'];
		nextNodeSchema: OnVisitNodePropsType['nextNodeSchema'];
		nextNodeAiPrompt: OnVisitNodePropsType['nextNodeAiPrompt'];
	}): Promise<DefaultReturnType<{ status: GeneralNodeReturnType['status']; content?: string }>> {
		try {
			const { executionId, nodeInstance, nodeId, toolNodes, nextNodeSchema, nextNodeAiPrompt } = props;

			if (!(nodeInstance instanceof ResponderBaseNode) && !(nodeInstance instanceof GeneralBaseNode)) {
				return {
					userMessage: 'Invalid node for execution!',
					error: 'Invalid node for execution!',
					errorType: 'BadRequestException',
					errorData: { nodeId, nodeType: nodeInstance.metadata.type },
					trace: [
						'WorkflowExecutorService - callExecute - if (!(nodeInstance instanceof ResponderBaseNode) && !(nodeInstance instanceof GeneralBaseNode))',
					],
				};
			}

			const workflowExecutionCache = await this.workflowCacheService.getWorkflowExecutionCache(executionId);
			if (isError(workflowExecutionCache)) {
				return {
					...workflowExecutionCache,
					trace: [
						...workflowExecutionCache.trace,
						'WorkflowExecutorService - callExecute - this.workflowCacheService.getWorkflowExecutionCache',
					],
				};
			}

			const {
				userId,
				userFullName,
				workflowId,
				connectionMap,
				triggerDetails,
				allResponses,
				nodeMap,
				generalSettings,
			} = workflowExecutionCache;

			const previousNodeId = connectionMap[nodeId]?.previousNodeIds[0];
			if (!previousNodeId) {
				return {
					userMessage: `Unable to get previous nodes for node ${nodeId}!`,
					error: `Unable to get previous nodes for node ${nodeId}!`,
					errorType: 'BadRequestException',
					errorData: { workflowId, nodeId },
					trace: ['WorkflowExecutorService - callExecute - !previousNodeId'],
				};
			}

			const lastResponse = allResponses[previousNodeId];

			if (nodeInstance instanceof ResponderBaseNode) {
				if (!triggerDetails) {
					return {
						userMessage: `Workflow trigger details not found, workflowId - ${workflowId}!`,
						error: `Workflow trigger details not found, workflowId - ${workflowId}!`,
						errorType: 'BadRequestException',
						errorData: { workflowId },
						trace: ['WorkflowExecutorService - callExecute - !triggerDetails'],
					};
				}

				if (['interact', 'webhook'].includes(triggerDetails.type)) {
					const response = await this.workflowResponderService.sendResponse({
						format: lastResponse.format,
						data: lastResponse.content,
						config: triggerDetails,
					});
					if (isError(response)) {
						return {
							...response,
							trace: [
								...response.trace,
								'WorkflowExecutorService - callExecute - this.workflowResponderService.sendResponse',
							],
						};
					}

					return { status: 'success' };
				} else {
					const response = await nodeInstance.execute({
						format: lastResponse.format,
						data: lastResponse.content,
						config: triggerDetails,
					});
					if (isError(response)) {
						return {
							...response,
							trace: [...response.trace, 'WorkflowExecutorService - callExecute - nodeInstance.execute'],
						};
					}
				}

				return { status: 'success' };
			}

			const config = nodeMap[nodeId].config;

			if (['google_signin', 'google_manual'].includes(config.auth_type)) {
				const isValid = await this.checkGoogleToken({
					executionId,
					nodeId,
					access_token: config.access_token,
					refresh_token: config.refresh_token,
				});
				if (isError(isValid)) {
					return {
						...isValid,
						trace: [...isValid.trace, 'WorkflowExecutorService - callExecute - this.checkGoogleToken'],
					};
				}

				if (isObject(isValid)) config.access_token = isValid.access_token;
			}

			const executeData = { format: lastResponse.format, data: lastResponse.content, config };

			if (nodeInstance.metadata.type === 'agent') {
				let uniqueChatId = '';

				if (triggerDetails.type === 'interact' || triggerDetails.type === 'webhook') {
					uniqueChatId = `${workflowId}-${triggerDetails.userId}`;
				}

				if (triggerDetails.type === 'telegram') {
					uniqueChatId = `${workflowId}-${triggerDetails.chatId}`;
				} else if (triggerDetails.type === 'discord') {
					uniqueChatId = `${workflowId}-${triggerDetails.channel_id}-${triggerDetails.message_id}`;
				} else if (triggerDetails.type === 'slack') {
					uniqueChatId = `${workflowId}-${triggerDetails.channel_id}-${triggerDetails.ts}`;
				} else if (triggerDetails.type === 'cron') {
					uniqueChatId = `${workflowId}-${triggerDetails.nodeId}`;
				} else if (triggerDetails.type === 'google-sheets') {
					uniqueChatId = `${workflowId}-${triggerDetails.file_id}`;
				} else if (triggerDetails.type === 'whatsapp') {
					uniqueChatId = `${workflowId}-${triggerDetails.phone_number_id}`;
				}

				if (!uniqueChatId) {
					return {
						userMessage: 'Unique chat ID not found for agent node!',
						error: 'Unique chat ID not found for agent node!',
						errorType: 'BadRequestException',
						errorData: { workflowExecutionCache, nodeId },
						trace: ['WorkflowExecutorService - callExecute - !uniqueChatId'],
					};
				}

				executeData.data = {
					...executeData.data,
					workflowId,
					memoryId: uniqueChatId,
					userId,
					userFullName,
					tools: toolNodes,
					nextNodeSchema,
					nextNodeAiPrompt,
				};
			}

			if (nodeInstance.metadata.type === 'rag') {
				executeData.data = {
					...executeData.data,
					userId,
				};
			}

			const response = await nodeInstance.execute(executeData);
			if (isError(response)) {
				return {
					...response,
					trace: [...response.trace, 'WorkflowExecutorService - callExecute - nodeInstance.execute'],
				};
			}

			if (response.status === 'hold') {
				return { status: 'hold', content: response.content };
			}

			const updatedExecutionCache = await this.workflowCacheService.getExecutionCache(executionId);
			if (isError(updatedExecutionCache)) {
				return {
					...updatedExecutionCache,
					trace: [
						...updatedExecutionCache.trace,
						'WorkflowExecutorService - callExecute - this.workflowCacheService.getExecutionCache',
					],
				};
			}

			updatedExecutionCache.allResponses[nodeId] = { format: response.format, content: response.content };

			const responseUpdate = await this.workflowCacheService.setExecutionCache({
				executionId: executionId,
				data: updatedExecutionCache,
			});
			if (isError(responseUpdate)) {
				return {
					...responseUpdate,
					trace: [
						...responseUpdate.trace,
						'WorkflowExecutorService - callExecute - this.workflowCacheService.setExecutionCache',
					],
				};
			}

			if (generalSettings.showResultFromAllNodes && triggerDetails.type !== 'webhook') {
				const response = await this.workflowResponderService.sendResponse({
					format: 'string',
					data: `Progress - Successfully executed ${nodeInstance.metadata.label}`,
					config: triggerDetails,
				});
				if (isError(response)) {
					log(workflowExecutionCache.userId, 'error', {
						message: response.error,
						data: response.errorData,
						trace: [
							...response.trace,
							'WorkflowExecutorService - callExecute - this.workflowResponderService.sendResponse',
						],
					});
				}
			}

			return { status: 'success' };
		} catch (error) {
			return {
				userMessage: 'Node execution failed!',
				error: 'Node execution failed!',
				errorType: 'InternalServerErrorException',
				errorData: {
					props,
					error: returnErrorString(error),
				},
				trace: ['WorkflowExecutorService - callExecute - catch'],
			};
		}
	}

	/**
	 * Check Google token
	 */
	private async checkGoogleToken(props: {
		executionId: string;
		nodeId: string;
		access_token: string | undefined;
		refresh_token: string | undefined;
	}): Promise<DefaultReturnType<true | { access_token: any; id_token: any }>> {
		const { executionId, nodeId, access_token, refresh_token } = props;

		if (!access_token || !refresh_token) {
			return {
				userMessage: 'Google auth tokens not found!',
				error: 'Google auth tokens not found!',
				errorType: 'BadRequestException',
				errorData: { executionId, nodeId },
				trace: ['WorkflowExecutorService - checkGoogleToken - !access_token || !refresh_token'],
			};
		}

		const isTokenValid = await isAccessTokenValid(access_token);
		if (isTokenValid) return true;

		const workflowExecutionCache = await this.workflowCacheService.getWorkflowExecutionCache(executionId);
		if (isError(workflowExecutionCache)) {
			return {
				...workflowExecutionCache,
				trace: [
					...workflowExecutionCache.trace,
					'WorkflowExecutorService - checkGoogleToken - this.workflowCacheService.getWorkflowExecutionCache',
				],
			};
		}

		const newTokens = await refreshAccessToken(refresh_token);
		if (isError(newTokens)) {
			return {
				...newTokens,
				trace: [...newTokens.trace, 'WorkflowExecutorService - checkGoogleToken - refreshAccessToken'],
			};
		}

		const response = await this.workflowService.updateWorkflow({
			workflowId: workflowExecutionCache.workflowId,
			updates: {
				config: [{ nodeId, updates: { access_token: newTokens.access_token, id_token: newTokens.id_token } }],
			},
			userId: undefined,
		});
		if (isError(response)) {
			return {
				...response,
				trace: [
					...response.trace,
					'WorkflowExecutorService - checkGoogleToken - this.workflowService.updateWorkflow',
				],
			};
		}

		workflowExecutionCache.nodeMap[nodeId].config.access_token = newTokens.access_token;

		const setWorkflowCacheResponse = await this.workflowCacheService.setWorkflowCache({
			workflowId: workflowExecutionCache.workflowId,
			data: workflowExecutionCache,
		});
		if (isError(setWorkflowCacheResponse)) {
			return {
				...setWorkflowCacheResponse,
				trace: [
					...setWorkflowCacheResponse.trace,
					'WorkflowExecutorService - checkGoogleToken - this.workflowCacheService.setWorkflowCache',
				],
			};
		}

		return newTokens;
	}
}
