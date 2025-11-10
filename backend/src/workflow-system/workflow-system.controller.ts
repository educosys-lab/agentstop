import { Body, Controller, Get, Post, Query } from '@nestjs/common';

import { WorkflowSystemService } from './services/system.service';
import { WorkflowTestService } from './services/test.service';
import {
	GeneralNodeReturnType,
	NodeConfigType,
	NodeMetadataType,
	ResponderDataFormatType,
} from './workflow-system.type';
import { WorkflowNodeService } from './services/node.service';
import { log } from 'src/shared/logger/logger';
import { isError, throwError } from 'src/shared/utils/error.util';
import { UserId } from 'src/auth/user-id.decorator';
import { PublicWorkflowType } from 'src/workflow/workflow.type';
import { WorkflowService } from 'src/workflow/workflow.service';

/**
 * @summary Workflow system controller
 * @description Controller for workflow system
 * @routes
 * - /workflow-system/nodes - GET
 * - /workflow-system/start-workflow - POST
 * - /workflow-system/stop-workflow - POST
 * - /workflow-system/test-node - POST
 * - /workflow-system/test-workflow - POST
 * - /workflow-system/dev-test-node - POST - Public
 */
@Controller('/workflow-system')
export class WorkflowSystemController {
	constructor(
		private readonly workflowSystemService: WorkflowSystemService,
		private readonly workflowTestService: WorkflowTestService,
		private readonly workflowNodeService: WorkflowNodeService,
		private readonly workflowService: WorkflowService,
	) {}

	/**
	 * Get all nodes
	 */
	@Get('/nodes')
	async getAllNodes(@UserId() userId: string): Promise<{ metadata: NodeMetadataType; config: NodeConfigType[] }[]> {
		await this.verifyUserId(userId);

		const getAllNodesResponse = await this.workflowNodeService.getAllNodes();
		if (isError(getAllNodesResponse)) {
			log(userId, 'error', {
				message: getAllNodesResponse.error,
				data: getAllNodesResponse.errorData,
				trace: [
					...getAllNodesResponse.trace,
					'WorkflowSystemController - getAllNodes - this.workflowNodeService.getAllNodes',
				],
			});

			throwError({ error: getAllNodesResponse.userMessage, errorType: getAllNodesResponse.errorType });
		}

		return getAllNodesResponse;
	}

	/**
	 * Activate workflow
	 */
	@Post('/start-workflow')
	async activate(@UserId() userId: string, @Body('workflowId') workflowId: string): Promise<PublicWorkflowType> {
		await this.verifyUserId(userId);

		const activateWorkflowResponse = await this.workflowSystemService.activateWorkflow({ userId, workflowId });
		if (isError(activateWorkflowResponse)) {
			log(userId, 'error', {
				message: activateWorkflowResponse.error,
				data: activateWorkflowResponse.errorData,
				trace: [
					...activateWorkflowResponse.trace,
					'WorkflowSystemController - activate - this.workflowSystemService.activateWorkflow',
				],
			});

			throwError({ error: activateWorkflowResponse.userMessage, errorType: activateWorkflowResponse.errorType });
		}

		const workflow = await this.workflowService.getWorkflow({ userId, workflowId });
		if (isError(workflow)) {
			log(userId, 'error', {
				message: workflow.error,
				data: workflow.errorData,
				trace: [...workflow.trace, 'WorkflowController - getWorkflow - if ("error" in workflow)'],
			});

			throwError({ error: workflow.userMessage, errorType: workflow.errorType });
		}

		const publicWorkflowData = await this.workflowService.getPublicWorkflowData([workflow]);
		if (isError(publicWorkflowData)) {
			log(userId, 'error', {
				message: publicWorkflowData.userMessage,
				data: publicWorkflowData.errorData,
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
	 * Terminate workflow
	 */
	@Post('/stop-workflow')
	async terminate(@UserId() userId: string, @Body('workflowId') workflowId: string): Promise<true> {
		await this.verifyUserId(userId);

		const terminateWorkflowResponse = await this.workflowSystemService.terminateWorkflow({ userId, workflowId });
		if (isError(terminateWorkflowResponse)) {
			log(userId, 'error', {
				message: terminateWorkflowResponse.error,
				data: terminateWorkflowResponse.errorData,
				trace: [
					...terminateWorkflowResponse.trace,
					'WorkflowSystemController - terminate - this.workflowSystemService.terminateWorkflow',
				],
			});

			throwError({
				error: terminateWorkflowResponse.userMessage,
				errorType: terminateWorkflowResponse.errorType,
			});
		}

		return true;
	}

	/**
	 * Test node
	 */
	@Post('/test-node')
	async testNode(
		@UserId() userId: string,
		@Body('nodeType') nodeType: string,
		@Body('format') format: ResponderDataFormatType,
		@Body('data') data: { defaultData: any } & Record<string, any>,
		@Body('config') config: Record<string, any>,
	): Promise<GeneralNodeReturnType> {
		await this.verifyUserId(userId);

		const testNodeResponse = await this.workflowTestService.testNode({ nodeType, format, data, config });
		if (isError(testNodeResponse)) {
			log(userId, 'error', {
				message: testNodeResponse.error,
				data: testNodeResponse.errorData,
				trace: [
					...testNodeResponse.trace,
					'WorkflowSystemController - testNode - this.workflowTestService.testNode',
				],
			});

			throwError({ error: testNodeResponse.userMessage, errorType: testNodeResponse.errorType });
		}

		return testNodeResponse;
	}

	/**
	 * Test workflow
	 */
	@Post('/test-workflow')
	async testWorkflow(@UserId() userId: string, @Query('workflowId') workflowId: string): Promise<string> {
		await this.verifyUserId(userId);

		const testWorkflowResponse = await this.workflowTestService.testWorkflow(workflowId);
		if (isError(testWorkflowResponse)) {
			log(userId, 'error', {
				message: testWorkflowResponse.error,
				data: testWorkflowResponse.errorData,
				trace: [
					...testWorkflowResponse.trace,
					'WorkflowSystemController - testWorkflow - this.workflowTestService.testWorkflow',
				],
			});

			throwError({ error: testWorkflowResponse.userMessage, errorType: testWorkflowResponse.errorType });
		}

		return testWorkflowResponse;
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
