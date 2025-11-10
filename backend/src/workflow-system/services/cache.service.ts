import { Injectable } from '@nestjs/common';

import { CacheService } from 'src/shared/cache/cache.service';
import { ExecutionCacheType, ResponderDataFormatType, WorkflowCacheType } from '../workflow-system.type';
import { log } from 'src/shared/logger/logger';
import { isObject } from 'src/shared/utils/object.util';
import { WorkflowParserService } from './parser.service';
import { DefaultReturnType } from 'src/shared/types/return.type';
import { TIME } from 'src/shared/constants/time.constant';
import { WorkflowPrivateService } from 'src/workflow/workflow.private';
import { returnErrorString } from 'src/shared/utils/return.util';
import { isError } from 'src/shared/utils/error.util';

/**
 * @summary Workflow cache service
 * @description Service for handling workflow cache operations
 * @functions
 * - getWorkflowExecutionCache
 * - getExecutionCache
 * - setExecutionCache
 * - updateExecutionResponse
 * - deleteExecutionCache
 * - deleteExecutionCacheByWorkflow
 * - setWorkflowCache
 * - deleteWorkflowCache
 *
 * @private
 * - getWorkflowCache
 */
@Injectable()
export class WorkflowCacheService {
	constructor(
		private readonly cacheService: CacheService,

		private readonly workflowPrivateService: WorkflowPrivateService,
		private readonly workflowParserService: WorkflowParserService,
	) {}

	/**
	 * Get workflow execution cache
	 */
	async getWorkflowExecutionCache(
		executionId: string,
	): Promise<DefaultReturnType<ExecutionCacheType & WorkflowCacheType>> {
		try {
			const executionCache = await this.getExecutionCache(executionId);
			if (isError(executionCache)) {
				return {
					...executionCache,
					trace: ['WorkflowCacheService - getWorkflowExecutionCache - this.getExecutionCache'],
				};
			}

			let workflowCache = await this.getWorkflowCache(executionCache.workflowId);
			if (isError(workflowCache)) {
				const workflow = await this.workflowPrivateService.getWorkflowInternal(executionCache.workflowId);
				if (isError(workflow)) {
					return {
						...workflow,
						trace: [
							'WorkflowCacheService - getWorkflowExecutionCache - this.workflowPrivateService.getWorkflowInternal',
						],
					};
				}

				if (workflow.status === 'deleted') {
					return {
						userMessage: 'Workflow has been deleted!',
						error: 'Workflow has been deleted!',
						errorType: 'NotFoundException',
						errorData: { workflowId: executionCache.workflowId },
						trace: ['WorkflowCacheService - getWorkflowExecutionCache - workflow.status === "deleted"'],
					};
				}

				const mapping = await this.workflowParserService.getConnectionMap(workflow);
				if (isError(mapping)) {
					return {
						...mapping,
						trace: [
							'WorkflowCacheService - getWorkflowExecutionCache - this.workflowParserService.getConnectionMap',
						],
					};
				}

				const addToCacheResponse = await this.setWorkflowCache({
					workflowId: workflow.id,
					data: {
						workflowId: workflow.id,
						connectionMap: mapping.connectionMap,
						nodeMap: mapping.nodeMap,
						generalSettings: workflow.generalSettings,
					},
				});
				if (isError(addToCacheResponse)) {
					return {
						...addToCacheResponse,
						trace: ['WorkflowCacheService - getWorkflowExecutionCache - this.setWorkflowCache'],
					};
				}

				workflowCache = {
					workflowId: workflow.id,
					connectionMap: mapping.connectionMap,
					nodeMap: mapping.nodeMap,
					generalSettings: workflow.generalSettings,
				};
			}

			if (!isObject(executionCache) || !isObject(workflowCache)) {
				return {
					userMessage: 'Internal server error!',
					error: 'Error getting workflow execution state cache!',
					errorType: 'InternalServerErrorException',
					errorData: { executionId },
					trace: ['WorkflowCacheService - getWorkflowExecutionCache - this.getWorkflowCache'],
				};
			}

			return { ...executionCache, ...workflowCache };
		} catch (error) {
			return {
				userMessage: 'Internal server error!',
				error: 'Error getting workflow execution state cache!',
				errorType: 'InternalServerErrorException',
				errorData: {
					executionId,
					error: returnErrorString(error),
				},
				trace: ['WorkflowCacheService - getWorkflowExecutionCache - catch'],
			};
		}
	}

	/**
	 * Get execution cache
	 */
	async getExecutionCache(executionId: string): Promise<DefaultReturnType<ExecutionCacheType>> {
		try {
			const data = await this.cacheService.get<ExecutionCacheType>(`execution-cache-${executionId}`);
			if (isError(data)) {
				return {
					...data,
					trace: ['WorkflowCacheService - getExecutionCache - this.cacheService.get'],
				};
			}

			return data;
		} catch (error) {
			return {
				userMessage: 'Internal server error!',
				error: 'Error getting execution state cache!',
				errorType: 'InternalServerErrorException',
				errorData: {
					executionId,
					error: returnErrorString(error),
				},
				trace: ['WorkflowCacheService - getExecutionCache - catch'],
			};
		}
	}

	/**
	 * Set execution cache
	 */
	async setExecutionCache(props: {
		executionId: string;
		data: ExecutionCacheType;
	}): Promise<DefaultReturnType<true>> {
		try {
			const { executionId, data } = props;
			const response = await this.cacheService.set({
				key: `execution-cache-${executionId}`,
				data,
				ttl: 'infinity',
			});
			if (isError(response)) {
				return {
					...response,
					trace: ['WorkflowCacheService - setExecutionCache - this.cacheService.set'],
				};
			}

			return true;
		} catch (error) {
			return {
				userMessage: 'Internal server error!',
				error: 'Error setting execution state cache!',
				errorType: 'InternalServerErrorException',
				errorData: {
					props,
					error: returnErrorString(error),
				},
				trace: ['WorkflowCacheService - setExecutionCache - catch'],
			};
		}
	}

	/**
	 * Update execution response
	 */
	async updateExecutionResponse(props: {
		executionId: string;
		nodeId: string;
		format: ResponderDataFormatType;
		content: any;
	}): Promise<DefaultReturnType<true>> {
		try {
			const { executionId, nodeId, format, content } = props;

			const executionCache = await this.getExecutionCache(executionId);
			if (isError(executionCache)) {
				return {
					...executionCache,
					trace: ['WorkflowCacheService - updateExecutionResponse - this.getExecutionCache'],
				};
			}

			const newState: ExecutionCacheType = {
				...executionCache,
				allResponses: { ...executionCache.allResponses, [nodeId]: { format, content } },
			};

			const result = await this.cacheService.set({
				key: `execution-cache-${executionId}`,
				data: newState,
				ttl: 'infinity',
			});
			if (isError(result)) {
				return {
					...result,
					trace: ['WorkflowCacheService - updateExecutionResponse - this.cacheService.set'],
				};
			}

			return true;
		} catch (error) {
			return {
				userMessage: 'Internal server error!',
				error: 'Error updating response cache!',
				errorType: 'InternalServerErrorException',
				errorData: {
					props,
					error: returnErrorString(error),
				},
				trace: ['WorkflowCacheService - updateExecutionResponse - catch'],
			};
		}
	}

	/**
	 * Delete execution cache
	 */
	async deleteExecutionCache(executionId: string): Promise<boolean> {
		try {
			const response = await this.cacheService.delete(`execution-cache-${executionId}`);
			if (isError(response)) {
				log('workflow', 'error', {
					message: response.error,
					data: { executionId, ...response.errorData },
					trace: [
						...response.trace,
						'WorkflowCacheService - deleteExecutionCache - this.cacheService.delete',
					],
				});
			}

			return true;
		} catch (error) {
			log('workflow', 'error', {
				message: 'Error deleting execution state cache!',
				data: {
					executionId,
					error: returnErrorString(error),
				},
				trace: ['WorkflowCacheService - deleteExecutionCache - catch'],
			});

			return false;
		}
	}

	/**
	 * Delete execution cache by workflow
	 */
	async deleteExecutionCacheByWorkflow(workflowId: string): Promise<boolean> {
		try {
			const workflow = await this.workflowPrivateService.getWorkflowInternal(workflowId);
			if (isError(workflow)) {
				log('workflow', 'error', {
					message: workflow.error,
					data: { workflowId, ...workflow.errorData },
					trace: [
						...workflow.trace,
						'WorkflowCacheService - deleteExecutionCacheByWorkflow - this.workflowPrivateService.getWorkflowInternal',
					],
				});
				return false;
			}

			const incompleteExecutionIds = workflow.report
				.filter((execution) => execution.executionStatus !== 'success')
				.map((execution) => execution.executionId);

			for (const executionId of incompleteExecutionIds) {
				const response = await this.cacheService.delete(`execution-cache-${executionId}`);
				if (isError(response)) {
					log('workflow', 'error', {
						message: response.error,
						data: {
							workflowId,
							...response.errorData,
						},
						trace: [
							...response.trace,
							'WorkflowCacheService - deleteExecutionCacheByWorkflow - this.cacheService.delete',
						],
					});
				}
			}

			return true;
		} catch (error) {
			log('workflow', 'error', {
				message: 'Error deleting execution state cache by workflow!',
				data: {
					workflowId,
					error: returnErrorString(error),
				},
				trace: ['WorkflowCacheService - deleteExecutionCacheByWorkflow - catch'],
			});

			return false;
		}
	}

	/**
	 * Get workflow cache
	 */
	private async getWorkflowCache(workflowId: string): Promise<DefaultReturnType<WorkflowCacheType>> {
		try {
			const workflowCache = await this.cacheService.get<WorkflowCacheType>(`workflow-cache-${workflowId}`);
			if (isError(workflowCache)) {
				return {
					...workflowCache,
					trace: ['WorkflowCacheService - getWorkflowCache - this.cacheService.get'],
				};
			}

			if (isObject(workflowCache)) {
				const ttl = await this.cacheService.getTtl(`workflow-cache-${workflowId}`);
				if (isError(ttl)) {
					return {
						...ttl,
						trace: ['WorkflowCacheService - getWorkflowCache - this.cacheService.getTtl'],
					};
				}

				if (ttl !== null && ttl < TIME.MINUTE_IN_MS) {
					const response = await this.setWorkflowCache({ workflowId, data: workflowCache });
					if (isError(response)) {
						return {
							...response,
							trace: ['WorkflowCacheService - getWorkflowCache - this.setWorkflowCache'],
						};
					}
				}

				return workflowCache;
			}

			return {
				userMessage: 'Internal server error!',
				error: 'Error getting workflow cache!',
				errorType: 'InternalServerErrorException',
				errorData: { workflowId },
				trace: ['WorkflowCacheService - getWorkflowCache - catch'],
			};
		} catch (error) {
			return {
				userMessage: 'Internal server error!',
				error: 'Error getting workflow cache!',
				errorType: 'InternalServerErrorException',
				errorData: {
					workflowId,
					error: returnErrorString(error),
				},
				trace: ['WorkflowCacheService - getWorkflowCache - catch'],
			};
		}
	}

	/**
	 * Set workflow cache
	 */
	async setWorkflowCache(props: { workflowId: string; data: WorkflowCacheType }): Promise<DefaultReturnType<true>> {
		try {
			const { workflowId, data } = props;

			const response = await this.cacheService.set({
				key: `workflow-cache-${workflowId}`,
				data,
				ttl: 10 * TIME.MINUTE_IN_MS,
			});
			if (isError(response)) {
				return {
					...response,
					trace: ['WorkflowCacheService - setWorkflowCache - this.cacheService.set'],
				};
			}

			return true;
		} catch (error) {
			return {
				userMessage: 'Internal server error!',
				error: 'Error setting workflow cache!',
				errorType: 'InternalServerErrorException',
				errorData: {
					props,
					error: returnErrorString(error),
				},
				trace: ['WorkflowCacheService - setWorkflowCache - catch'],
			};
		}
	}

	/**
	 * Delete workflow cache
	 */
	async deleteWorkflowCache(workflowId: string): Promise<boolean> {
		try {
			const response = await this.cacheService.delete(`workflow-cache-${workflowId}`);
			if (isError(response)) {
				log('workflow', 'error', {
					message: response.error,
					data: { workflowId, ...response.errorData },
					trace: [...response.trace, 'WorkflowCacheService - deleteWorkflowCache - this.cacheService.delete'],
				});
			}

			return true;
		} catch (error) {
			log('workflow', 'error', {
				message: 'Error deleting workflow cache!',
				data: {
					workflowId,
					error: returnErrorString(error),
				},
				trace: ['WorkflowCacheService - deleteWorkflowCache - catch'],
			});

			return false;
		}
	}
}
