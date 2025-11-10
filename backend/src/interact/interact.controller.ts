import { Body, Controller, Get, Patch, Query } from '@nestjs/common';

import { PublicInteractType, AddInteractMembersType, UserInteractsType } from './interact.type';
import { InteractService } from './interact.service';
import { log } from 'src/shared/logger/logger';
import { isError, throwError } from 'src/shared/utils/error.util';
import { UserId } from 'src/auth/user-id.decorator';
import { getPublicInteractData } from './interact.util';
import { WorkflowService } from 'src/workflow/workflow.service';
import { UserPrivateService } from 'src/user/user.private';

/**
 * @summary Interact controller
 * @description Controller for interact operations
 * @routes
 * - /interact - GET
 * - /interact/user - GET
 * - /interact/members - PATCH
 * - /interact/delete-members - PATCH
 * - /interact/delete - DELETE
 *
 * @private
 * - verifyUserId
 */
@Controller('/interact')
export class InteractController {
	constructor(
		private readonly interactService: InteractService,
		private readonly userPrivateService: UserPrivateService,
		private readonly workflowService: WorkflowService,
	) {}

	/**
	 * Get interact
	 */
	@Get('/')
	async getInteract(@UserId() userId: string, @Query('workflowId') workflowId: string): Promise<PublicInteractType> {
		await this.verifyUserId(userId);

		const interact = await this.interactService.getInteract(workflowId);
		if (isError(interact)) {
			log(userId, 'error', {
				message: interact.error,
				data: interact.errorData,
				trace: [...interact.trace, 'InteractController - getInteract - this.interactService.getInteract'],
			});
			throwError({ error: interact.userMessage, errorType: interact.errorType });
		}

		const workflow = await this.workflowService.getWorkflow({ userId, workflowId });
		if (isError(workflow)) {
			log(userId, 'error', {
				message: workflow.error,
				data: workflow.errorData,
				trace: [...workflow.trace, 'InteractController - getInteract - this.workflowService.getWorkflow'],
			});
			throwError({ error: workflow.userMessage, errorType: workflow.errorType });
		}

		const interactUsers = await this.userPrivateService.getMultipleUsersInternal({
			id: interact.members.map((member) => member.userId),
		});
		if (isError(interactUsers)) {
			log(userId, 'error', {
				message: interactUsers.error,
				data: interactUsers.errorData,
				trace: [
					...interactUsers.trace,
					'InteractController - getInteract - this.userPrivateService.getMultipleUsersInternal',
				],
			});
			throwError({ error: interactUsers.userMessage, errorType: interactUsers.errorType });
		}

		const publicChatData = getPublicInteractData({
			userId,
			interact,
			workflow,
			interactUsers,
		});
		if (isError(publicChatData)) {
			log(userId, 'error', {
				message: publicChatData.error,
				data: publicChatData.errorData,
				trace: [...publicChatData.trace, 'InteractController - getInteract - getPublicInteractData'],
			});
			throwError({ error: publicChatData.userMessage, errorType: publicChatData.errorType });
		}

		return publicChatData;
	}

	/**
	 * Get user interacts
	 */
	@Get('/user')
	async getUserInteracts(@UserId() userId: string): Promise<UserInteractsType[]> {
		await this.verifyUserId(userId);

		const response = await this.interactService.getUserInteracts(userId);
		if (isError(response)) {
			log(userId, 'error', {
				message: response.error,
				data: response.errorData,
				trace: [
					...response.trace,
					'InteractController - getUserInteracts - this.interactService.getUserInteracts',
				],
			});
			throwError({ error: response.userMessage, errorType: response.errorType });
		}

		return response;
	}

	/**
	 * Add members to interact
	 */
	@Patch('/members')
	async addMembers(@UserId() userId: string, @Body() props: AddInteractMembersType): Promise<true> {
		await this.verifyUserId(userId);

		const response = await this.interactService.addMembers(props);
		if (isError(response)) {
			log(userId, 'error', {
				message: response.error,
				data: response.errorData,
				trace: [...response.trace, 'InteractController - addMembers - this.interactService.addMembers'],
			});
			throwError({ error: response.userMessage, errorType: response.errorType });
		}

		return response;
	}

	/**
	 * Delete members from interact
	 */
	@Patch('/delete-members')
	async deleteMembers(@UserId() userId: string, @Body() props: AddInteractMembersType): Promise<true> {
		await this.verifyUserId(userId);

		const response = await this.interactService.deleteMembers(props);
		if (isError(response)) {
			log(userId, 'error', {
				message: response.error,
				data: response.errorData,
				trace: [...response.trace, 'InteractController - deleteMembers - this.interactService.deleteMembers'],
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
			log('interact', 'error', {
				message: 'User is unauthorized!',
				data: {},
				trace: ['InteractController - verifyUserId - if (!userId)'],
			});
			throwError({ error: 'User is unauthorized!', errorType: 'UnauthorizedException' });
		}

		return true;
	}
}
