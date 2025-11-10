import { Controller, Get, Post, Body, Delete, Query, Patch } from '@nestjs/common';

import { WorkflowService } from './workflow.service';
import {
	MarketplaceWorkflowListType,
	PublicWorkflowType,
	UserWorkflowType,
	// WorkflowType
} from './workflow.type';
import { isError, throwError } from 'src/shared/utils/error.util';
import { log } from 'src/shared/logger/logger';
import { UserId } from 'src/auth/user-id.decorator';
import { UpdateWorkflowType } from './workflow.type';

/**
 * @summary Workflow controller
 * @description Controller for handling workflow operations
 * @routes
 * - /workflow - GET
 * - /workflow/user - GET
 * - /workflow/public - GET
 * - /workflow/deleted - GET
 * - /workflow - POST
 * - /workflow - PATCH
 * - /workflow/complete - PATCH
 * - /workflow - DELETE
 * - /workflow/restore - POST
 * - /workflow/global-mission-stats - GET
 *
 * @private
 * - verifyUserId
 */
@Controller('/workflow')
export class WorkflowController {
	constructor(private readonly workflowService: WorkflowService) {}

	/**
	 * Get workflow
	 */
	@Get('/')
	async getWorkflow(@UserId() userId: string, @Query('workflowId') workflowId: string): Promise<PublicWorkflowType> {
		await this.verifyUserId(userId);

		const response = await this.workflowService.getWorkflow({ userId, workflowId });
		if (isError(response)) {
			log(userId, 'error', {
				message: response.userMessage,
				data: { response },
				trace: [...response.trace, 'WorkflowController - getWorkflow - if ("error" in response)'],
			});

			throwError({ error: response.userMessage, errorType: response.errorType });
		}

		const publicWorkflowData = await this.workflowService.getPublicWorkflowData([response]);
		if (isError(publicWorkflowData)) {
			log(userId, 'error', {
				message: publicWorkflowData.userMessage,
				data: { publicWorkflowData, response },
				trace: [
					...publicWorkflowData.trace,
					'WorkflowController - getWorkflow - if ("error" in publicWorkflowData)',
				],
			});

			throwError({ error: publicWorkflowData.userMessage, errorType: publicWorkflowData.errorType });
		}

		return publicWorkflowData[0];
	}

	/**
	 * Get user workflows
	 */
	@Get('/user')
	async getUserWorkflows(@UserId() userId: string): Promise<UserWorkflowType[]> {
		await this.verifyUserId(userId);

		const response = await this.workflowService.getUserWorkflows(userId);
		if (isError(response)) {
			log(userId, 'error', {
				message: response.userMessage,
				data: { response },
				trace: [...response.trace, 'WorkflowController - getUserWorkflows - if ("error" in response)'],
			});

			throwError({ error: response.userMessage, errorType: response.errorType });
		}

		const userWorkflowsData = response.map((workflow) => ({
			id: workflow.id,
			title: workflow.title,
			createTime: workflow.createTime,
			updateTime: workflow.updateTime,
			isPublic: workflow.isPublic,
			status: workflow.status,
			report: {
				successExecutions: workflow.report.filter((execution) => execution.executionStatus === 'success')
					.length,
				failedExecutions: workflow.report.filter((execution) => execution.executionStatus === 'failed').length,
			},
		}));

		return userWorkflowsData;
	}

	/**
	 * Get public workflows
	 */
	@Get('/public')
	async getPublicWorkflow(@UserId() userId: string): Promise<MarketplaceWorkflowListType[]> {
		await this.verifyUserId(userId);

		const response = await this.workflowService.getPublicWorkflow();
		if (isError(response)) {
			log(userId, 'error', {
				message: response.userMessage,
				data: { response },
				trace: [...response.trace, 'WorkflowController - getPublicWorkflow - if ("error" in response)'],
			});
			throwError({ error: response.userMessage, errorType: response.errorType });
		}

		return response;
	}

	/**
	 * Get deleted workflows
	 */
	@Get('/deleted')
	async getDeletedWorkflow(@UserId() userId: string): Promise<PublicWorkflowType[]> {
		await this.verifyUserId(userId);

		const response = await this.workflowService.getUserDeletedWorkflows(userId);
		if (isError(response)) {
			log(userId, 'error', {
				message: response.userMessage,
				data: { response },
				trace: [...response.trace, 'WorkflowController - getDeletedWorkflow - if ("error" in response)'],
			});

			throwError({ error: response.userMessage, errorType: response.errorType });
		}

		const publicWorkflowData = await this.workflowService.getPublicWorkflowData(response);
		if (isError(publicWorkflowData)) {
			log(userId, 'error', {
				message: publicWorkflowData.userMessage,
				data: { publicWorkflowData },
				trace: [
					...publicWorkflowData.trace,
					'WorkflowController - getDeletedWorkflow - if ("error" in publicWorkflowData)',
				],
			});

			throwError({ error: publicWorkflowData.userMessage, errorType: publicWorkflowData.errorType });
		}

		return publicWorkflowData;
	}

	/**
	 * Create workflow
	 */
	@Post('/')
	async createWorkflow(@UserId() userId: string, @Body('title') title: string): Promise<string> {
		await this.verifyUserId(userId);

		const response = await this.workflowService.createWorkflow({ userId, title });
		if (isError(response)) {
			log(userId, 'error', {
				message: response.userMessage,
				data: { response },
				trace: [...response.trace, 'WorkflowController - createWorkflow - if ("error" in response)'],
			});

			throwError({ error: response.userMessage, errorType: response.errorType });
		}

		return response;
	}

	/**
	 * Update workflow
	 */
	@Patch('/')
	async updateWorkflow(
		@UserId() userId: string,
		@Query('workflowId') workflowId: string,
		@Body('updates') updates: UpdateWorkflowType,
	): Promise<PublicWorkflowType> {
		await this.verifyUserId(userId);

		const response = await this.workflowService.updateWorkflow({ workflowId, updates, userId });
		if (isError(response)) {
			log(userId, 'error', {
				message: response.userMessage,
				data: { response },
				trace: [...response.trace, 'WorkflowController - updateWorkflow - if ("error" in response)'],
			});
			throwError({ error: response.userMessage, errorType: response.errorType });
		}

		const publicWorkflowData = await this.workflowService.getPublicWorkflowData([response]);
		if (isError(publicWorkflowData)) {
			log(userId, 'error', {
				message: publicWorkflowData.userMessage,
				data: { publicWorkflowData },
				trace: [
					...publicWorkflowData.trace,
					'WorkflowController - updateWorkflow - if ("error" in publicWorkflowData)',
				],
			});

			throwError({ error: publicWorkflowData.userMessage, errorType: publicWorkflowData.errorType });
		}

		return publicWorkflowData[0];
	}

	/**
	 * Delete workflow
	 */
	@Delete('/')
	async deleteWorkflow(@UserId() userId: string, @Query('workflowId') workflowId: string): Promise<true> {
		await this.verifyUserId(userId);

		const response = await this.workflowService.deleteWorkflow({ workflowId, userId });
		if (isError(response)) {
			log(userId, 'error', {
				message: response.userMessage,
				data: { response },
				trace: [...response.trace, 'WorkflowController - deleteWorkflow - if ("error" in response)'],
			});
			throwError({ error: response.userMessage, errorType: response.errorType });
		}

		return response;
	}

	/**
	 * Restore workflow
	 */
	@Post('/restore')
	async restoreWorkflow(@UserId() userId: string, @Body('workflowId') workflowId: string): Promise<true> {
		await this.verifyUserId(userId);

		const response = await this.workflowService.restoreWorkflow({ workflowId, userId });
		if (isError(response)) {
			log(userId, 'error', {
				message: response.userMessage,
				data: { response },
				trace: [...response.trace, 'WorkflowController - restoreWorkflow - if ("error" in response)'],
			});
			throwError({ error: response.userMessage, errorType: response.errorType });
		}

		return response;
	}

	/**
	 * Get user global mission stats
	 */
	@Get('/global-mission-stats')
	async getUserGlobalMissionStats(@UserId() userId: string): Promise<{ totalExecutions: number }> {
		await this.verifyUserId(userId);

		const response = await this.workflowService.getUserGlobalMissionStats(userId);
		if (isError(response)) {
			log(userId, 'error', {
				message: response.userMessage,
				data: { response },
				trace: [...response.trace, 'WorkflowController - getUserGlobalMissionStats - if ("error" in response)'],
			});

			throwError({ error: response.userMessage, errorType: response.errorType });
		}

		return response;
	}

	/**
	 * Verify user ID
	 */
	private async verifyUserId(userId: string | undefined): Promise<true> {
		if (!userId) {
			log('workflow', 'error', {
				message: 'User is unauthorized!',
				data: {},
				trace: ['WorkflowController - verifyUser - if (!userId)'],
			});
			throwError({ error: 'User is unauthorized!', errorType: 'UnauthorizedException' });
		}

		return true;
	}
}
