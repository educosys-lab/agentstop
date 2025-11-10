import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { v4 as uuid } from 'uuid';

import {
	MarketplaceWorkflowListType,
	NodeType,
	omittedWorkflowFields,
	PublicWorkflowType,
	UpdateWorkflowType,
	WorkflowType,
} from './workflow.type';
import { UserService } from 'src/user/user.service';
import {
	createWorkflowValidation,
	createWorkflowWithTemplateValidation,
	deleteWorkflowValidation,
	getUserDeletedWorkflowValidation,
	getUserWorkflowValidation,
	getWorkflowValidation,
	restoreWorkflowValidation,
	// updateCompleteWorkflowValidation,
	updateWorkflowValidation,
} from './workflow.validate';
import { WorkflowTriggersService } from 'src/workflow-triggers/workflow-triggers.service';
import { WorkflowInteractionService } from 'src/interact/workflow-interaction/workflow-interaction.service';
import { TemplateType } from 'src/template/template.type';
import { DefaultReturnType } from 'src/shared/types/return.type';
import { validate } from 'src/shared/utils/zod.util';
import { UserPrivateService } from 'src/user/user.private';
import { WorkflowPrivateService } from './workflow.private';
import { TIME } from 'src/shared/constants/time.constant';
import { returnErrorString } from 'src/shared/utils/return.util';
import { isError } from 'src/shared/utils/error.util';

/**
 * @summary Workflow service
 * @description Workflow service is responsible for managing workflows
 * @function
 * - getWorkflow
 * - getUserWorkflows
 * - getPublicWorkflow
 * - getUserDeletedWorkflows
 * - createWorkflow
 * - createWorkflowWithTemplate
 * - updateWorkflow
 * - deleteWorkflow
 * - restoreWorkflow
 * - getPublicWorkflowData
 * - getUserGlobalMissionStats
 * - permanentlyDeleteOldWorkflows
 *
 * @private
 * - checkIfWorkflowLimitReached
 * - checkTriggers
 * - deleteTriggers
 * - workflowHasInteractTrigger
 */
@Injectable()
export class WorkflowService {
	constructor(
		@InjectModel('Workflow') private WorkflowModel: Model<WorkflowType>,

		private readonly userService: UserService,
		private readonly workflowTriggersService: WorkflowTriggersService,
		private readonly workflowInteractionService: WorkflowInteractionService,
		private readonly userPrivateService: UserPrivateService,
		private readonly workflowPrivateService: WorkflowPrivateService,
	) {}

	/**
	 * Get workflow
	 */
	async getWorkflow(props: { userId: string; workflowId: string }): Promise<DefaultReturnType<WorkflowType>> {
		const validationResult = validate({ data: props, schema: getWorkflowValidation });
		if (isError(validationResult)) {
			return {
				...validationResult,
				trace: [...validationResult.trace, 'WorkflowService - getWorkflow - if ("error" in validationResult)'],
			};
		}

		const { userId, workflowId } = props;

		const workflow = await this.WorkflowModel.findOne({ id: validationResult.workflowId }).lean().exec();
		if (!workflow) {
			return {
				userMessage: 'Workflow does not exist!',
				error: 'Workflow does not exist!',
				errorType: 'NotFoundException',
				errorData: { workflowId },
				trace: ['WorkflowService - getWorkflow - if (!workflow)'],
			};
		}

		if (workflow.status === 'deleted') {
			return {
				userMessage: 'Workflow has been deleted!',
				error: 'Workflow has been deleted!',
				errorType: 'NotFoundException',
				errorData: { workflowId },
				trace: ['WorkflowService - getWorkflow - if (workflow.status === "deleted")'],
			};
		}

		const user = await this.userService.getUser({ id: userId });
		if (isError(user)) {
			return {
				...user,
				trace: [...user.trace, 'WorkflowService - getWorkflow - user'],
			};
		}

		if (userId !== workflow.createdBy && !user.isAdmin && !workflow.isPublic) {
			return {
				userMessage: 'User does not have access to this workflow!',
				error: 'User does not have access to this workflow!',
				errorType: 'UnauthorizedException',
				errorData: { userId, workflowId },
				trace: [
					'WorkflowService - getWorkflow - if (userId !== workflow.createdBy && !user.isAdmin && !workflow.isPublic)',
				],
			};
		}

		return workflow;
	}

	/**
	 * Get user workflows
	 */
	async getUserWorkflows(userId: string): Promise<DefaultReturnType<WorkflowType[]>> {
		const validationResult = validate({ data: { userId }, schema: getUserWorkflowValidation });
		if (isError(validationResult)) {
			return {
				...validationResult,
				trace: [...validationResult.trace, 'WorkflowService - getUserWorkflows - validationResult'],
			};
		}

		const userWorkflows = await this.WorkflowModel.find({
			createdBy: validationResult.userId,
			status: { $ne: 'deleted' },
		})
			.lean()
			.exec();
		if (!userWorkflows) {
			return {
				userMessage: 'Error fetching user workflows!',
				error: 'Error fetching user workflows!',
				errorType: 'InternalServerErrorException',
				errorData: { userId },
				trace: ['WorkflowService - getUserWorkflows - if (!userWorkflows)'],
			};
		}

		return userWorkflows;
	}

	/**
	 * Get public workflows
	 */
	async getPublicWorkflow(): Promise<DefaultReturnType<MarketplaceWorkflowListType[]>> {
		const publicWorkflows = await this.WorkflowModel.find({
			isPublic: true,
			status: { $ne: 'deleted' },
		})
			.lean()
			.exec();
		if (!publicWorkflows) {
			return {
				userMessage: 'Error fetching public workflows!',
				error: 'Error fetching public workflows!',
				errorType: 'InternalServerErrorException',
				errorData: {},
				trace: ['WorkflowService - getPublicWorkflow - if (!publicWorkflows)'],
			};
		}

		const updatedWorkflows = [] as MarketplaceWorkflowListType[];

		for (const workflow of publicWorkflows) {
			const creator = await this.userService.getUser({ id: workflow.createdBy });
			if (isError(creator)) {
				return {
					...creator,
					trace: [...creator.trace, 'WorkflowService - getPublicWorkflow - creator'],
				};
			}

			const publicWorkflows = {
				id: workflow.id,
				title: workflow.title,
				createTime: workflow.createTime,
				updateTime: workflow.updateTime,
				creator: creator
					? {
							name: `${creator.firstName} ${creator.lastName}`,
							username: creator.username,
							image: creator.image,
						}
					: { name: 'Anonymous', username: 'anonymous', image: '' },
			};

			updatedWorkflows.push(publicWorkflows);
		}

		return updatedWorkflows;
	}

	/**
	 * Get deleted workflows
	 */
	async getUserDeletedWorkflows(userId: string): Promise<DefaultReturnType<WorkflowType[]>> {
		const validationResult = validate({ data: { userId }, schema: getUserDeletedWorkflowValidation });
		if (isError(validationResult)) {
			return {
				...validationResult,
				trace: [...validationResult.trace, 'WorkflowService - getUserDeletedWorkflows - validationResult'],
			};
		}

		const deletedWorkflows = await this.WorkflowModel.find({
			createdBy: validationResult.userId,
			status: 'deleted',
		})
			.lean()
			.exec();
		if (!deletedWorkflows) {
			return {
				userMessage: 'Error fetching user deleted workflows!',
				error: 'Error fetching user deleted workflows!',
				errorType: 'InternalServerErrorException',
				errorData: { userId },
				trace: ['WorkflowService - getDeletedWorkflows - if (!deletedWorkflows)'],
			};
		}

		return deletedWorkflows;
	}

	/**
	 * Create workflow
	 */
	async createWorkflow(props: { userId: string; title: string }): Promise<DefaultReturnType<string>> {
		const validationResult = validate({ data: props, schema: createWorkflowValidation });
		if (isError(validationResult)) {
			return {
				...validationResult,
				trace: [...validationResult.trace, 'WorkflowService - createWorkflow - validationResult'],
			};
		}

		const { userId, title } = validationResult;

		const user = await this.userService.getUser({ id: userId });
		if (isError(user)) {
			return {
				...user,
				trace: [...user.trace, 'WorkflowService - createWorkflow - user'],
			};
		}

		const userWorkflows = await this.getUserWorkflows(userId);
		if (isError(userWorkflows)) {
			return {
				...userWorkflows,
				trace: [...userWorkflows.trace, 'WorkflowService - createWorkflow - userWorkflows'],
			};
		}

		const workflowExistsWithSameNameForTheUser = await this.WorkflowModel.findOne({
			title,
			createdBy: userId,
			status: { $ne: 'deleted' },
		})
			.lean()
			.exec();

		if (workflowExistsWithSameNameForTheUser) {
			return {
				userMessage: 'Workflow with same name already exists for this user!',
				error: 'Workflow with same name already exists for this user!',
				errorType: 'ConflictException',
				errorData: {},
				trace: ['WorkflowService - createWorkflow - if (workflowExistsWithSameNameForTheUser)'],
			};
		}

		const workflowId = uuid();
		const workflowData: Partial<WorkflowType> = { ...validationResult, id: workflowId };

		workflowData.createTime = Date.now();
		workflowData.updateTime = Date.now();
		workflowData.createdBy = userId;
		workflowData.generalSettings = { showResultFromAllNodes: true };
		workflowData.config = { dummy: 'dummy' };

		const createdWorkflow = await this.WorkflowModel.create(workflowData).then((workflow: any) => workflow._doc);
		if (!createdWorkflow) {
			return {
				userMessage: 'Error creating workflow!',
				error: 'Error creating workflow!',
				errorType: 'InternalServerErrorException',
				errorData: { title: validationResult.title },
				trace: ['WorkflowService - createWorkflow - if (!createdWorkflow)'],
			};
		}

		return createdWorkflow.id;
	}

	/**
	 * Create workflow with template
	 */
	async createWorkflowWithTemplate(props: {
		userId: string;
		template: TemplateType;
	}): Promise<DefaultReturnType<string>> {
		const validationResult = validate({ data: props, schema: createWorkflowWithTemplateValidation });
		if (isError(validationResult)) {
			return {
				...validationResult,
				trace: [...validationResult.trace, 'WorkflowService - createWorkflowWithTemplate - validationResult'],
			};
		}

		const { userId, template } = validationResult;

		const user = await this.userService.getUser({ id: userId });
		if (isError(user)) {
			return {
				...user,
				trace: [...user.trace, 'WorkflowService - createWorkflowWithTemplate - userDetails'],
			};
		}

		const userWorkflows = await this.getUserWorkflows(userId);
		if (isError(userWorkflows)) {
			return {
				...userWorkflows,
				trace: [...userWorkflows.trace, 'WorkflowService - createWorkflowWithTemplate - userWorkflows'],
			};
		}

		let copyTitle = 'Mission 1';
		let isValidCopyTitle = false;

		while (!isValidCopyTitle) {
			const workflowExistsWithSameNameForTheUser = userWorkflows.some((workflow) => workflow.title === copyTitle);

			if (workflowExistsWithSameNameForTheUser) {
				const count = Number(copyTitle.split(' ').pop());
				copyTitle = `Mission ${count + 1}`;
			} else isValidCopyTitle = true;
		}

		const workflowId = uuid();
		const workflowData: Partial<WorkflowType> = {
			id: workflowId,
			createTime: Date.now(),
			updateTime: Date.now(),
			createdBy: userId,
			generalSettings: { showResultFromAllNodes: true },
			config: { dummy: 'dummy' },

			title: copyTitle,
			nodes: template.nodes || [],
			edges: template.edges || [],
			preview: template.preview || '',
			notes: template.notes || '',
		};

		const createdWorkflow = await this.WorkflowModel.create(workflowData).then((workflow: any) => workflow._doc);
		if (!createdWorkflow) {
			return {
				userMessage: 'Error creating workflow!',
				error: 'Error creating workflow!',
				errorType: 'InternalServerErrorException',
				errorData: { template },
				trace: ['WorkflowService - createWorkflowWithTemplate - if (!createdWorkflow)'],
			};
		}

		return createdWorkflow.id;
	}

	/**
	 * Update workflow
	 */
	async updateWorkflow(props: {
		workflowId: string;
		updates: UpdateWorkflowType;
		userId: string | undefined;
	}): Promise<DefaultReturnType<WorkflowType>> {
		// If userId is not provided, it is an internal update
		const isInternalUpdate = !props.userId;

		const validationResult = validate({ data: props, schema: updateWorkflowValidation });
		if (isError(validationResult)) {
			return {
				...validationResult,
				trace: [...validationResult.trace, 'WorkflowService - updateWorkflow - validationResult'],
			};
		}

		const {
			workflowId,
			updates: { config, report, ...data },
			userId,
		} = validationResult;

		const workflowData = await this.workflowPrivateService.getWorkflowInternal(workflowId);
		if (isError(workflowData)) {
			return {
				...workflowData,
				trace: [...workflowData.trace, 'WorkflowService - updateWorkflow - workflowData'],
			};
		}

		if (workflowData.status === 'live' && !isInternalUpdate) {
			return {
				userMessage: 'Live missions can not be edited!',
				error: 'Live missions can not be edited!',
				errorType: 'ForbiddenException',
				errorData: {},
				trace: ['WorkflowService - updateWorkflow - if (workflowData.status === "live")'],
			};
		}
		if (workflowData.status === 'deleted' && !isInternalUpdate) {
			return {
				userMessage: 'Workflow has been deleted!',
				error: 'Workflow has been deleted!',
				errorType: 'NotFoundException',
				errorData: { workflowId },
				trace: ['WorkflowService - updateWorkflow - if (workflowData.status === "deleted")'],
			};
		}
		if (userId && workflowData.createdBy !== userId && !isInternalUpdate) {
			return {
				userMessage: 'User does not have access to this workflow!',
				error: 'User does not have access to this workflow!',
				errorType: 'UnauthorizedException',
				errorData: { workflowId },
				trace: ['WorkflowService - updateWorkflow - if (workflowData.createdBy !== userIdData.data)'],
			};
		}

		const updatedWorkflow: WorkflowType = { ...workflowData, ...data, updateTime: Date.now() } as WorkflowType;

		if (config) {
			for (const item of config) {
				updatedWorkflow.config[item.nodeId] = {
					...updatedWorkflow.config[item.nodeId],
					...item.updates,
				};
			}
		}

		if (report) {
			const reportIndex = updatedWorkflow.report.findIndex((item) => item.executionId === report.executionId);
			if (reportIndex === -1 && 'executionTime' in report) {
				updatedWorkflow.report.push(report);
			} else {
				updatedWorkflow.report[reportIndex] = { ...updatedWorkflow.report[reportIndex], ...report };
			}
		}

		const deleteTriggersResponse = await this.deleteTriggers(updatedWorkflow);
		if (isError(deleteTriggersResponse)) {
			return {
				...deleteTriggersResponse,
				trace: [...deleteTriggersResponse.trace, 'WorkflowService - updateWorkflow - deleteTriggersResponse'],
			};
		}

		if (userId) {
			const checkTriggersResponse = await this.checkTriggers({ userId, data: updatedWorkflow });
			if (isError(checkTriggersResponse)) {
				return {
					...checkTriggersResponse,
					trace: [...checkTriggersResponse.trace, 'WorkflowService - updateWorkflow - checkTriggersResponse'],
				};
			}
		}

		const workflowHasInteractTriggerResponse = await this.workflowHasInteractTrigger({
			userId,
			workflow: updatedWorkflow,
		});

		if (isError(workflowHasInteractTriggerResponse)) {
			return {
				...workflowHasInteractTriggerResponse,
				trace: [
					...workflowHasInteractTriggerResponse.trace,
					'WorkflowService - updateWorkflow - workflowHasInteractTriggerResponse',
				],
			};
		}

		const currentNodeIds = updatedWorkflow.nodes.map((node) => node.id);
		Object.keys(updatedWorkflow.config).forEach((nodeId) => {
			if (currentNodeIds.includes(nodeId)) return;
			delete updatedWorkflow.config[nodeId];
		});

		const workflowWithLastUpdates = await this.WorkflowModel.findOneAndUpdate(
			{ id: workflowId },
			{ $set: updatedWorkflow },
			{ new: true },
		)
			.lean()
			.exec();
		if (!workflowWithLastUpdates) {
			return {
				userMessage: 'Error updating workflow!',
				error: 'Error updating workflow!',
				errorType: 'InternalServerErrorException',
				errorData: { props },
				trace: ['WorkflowService - updateWorkflow - if (!workflowWithLastUpdates)'],
			};
		}

		return workflowWithLastUpdates;
	}

	/**
	 * Delete workflow
	 */
	async deleteWorkflow(props: { workflowId: string; userId: string }): Promise<DefaultReturnType<true>> {
		const validationResult = validate({ data: props, schema: deleteWorkflowValidation });
		if (isError(validationResult)) {
			return {
				...validationResult,
				trace: [...validationResult.trace, 'WorkflowService - deleteWorkflow - validationResult'],
			};
		}

		const { workflowId, userId } = validationResult;

		const workflow = await this.getWorkflow({ userId, workflowId });
		if (isError(workflow)) {
			return {
				...workflow,
				trace: [...workflow.trace, 'WorkflowService - deleteWorkflow - workflow'],
			};
		}

		if (workflow.createdBy !== userId) {
			return {
				userMessage: 'User does not have access to this workflow!',
				error: 'User does not have access to this workflow!',
				errorType: 'UnauthorizedException',
				errorData: { workflowId },
				trace: ['WorkflowService - deleteWorkflow - if (workflow.createdBy !== userId)'],
			};
		}

		const response = await this.WorkflowModel.findOneAndUpdate(
			{ id: workflowId },
			{ status: 'deleted', updateTime: Date.now() },
			{ new: true },
		)
			.lean()
			.exec();
		if (!response) {
			return {
				userMessage: 'Error deleting workflow!',
				error: 'Error deleting workflow!',
				errorType: 'InternalServerErrorException',
				errorData: { workflowId },
				trace: ['WorkflowService - deleteWorkflow - if (!response)'],
			};
		}

		return true;
	}

	/**
	 * Restore workflow
	 */
	async restoreWorkflow(props: { workflowId: string; userId: string }): Promise<DefaultReturnType<true>> {
		const validationResult = validate({ data: props, schema: restoreWorkflowValidation });
		if (isError(validationResult)) {
			return {
				...validationResult,
				trace: [...validationResult.trace, 'WorkflowService - restoreWorkflow - validationResult'],
			};
		}

		const { workflowId, userId } = validationResult;

		const workflow = await this.getWorkflow({ userId, workflowId });
		if (isError(workflow)) {
			return {
				...workflow,
				trace: [...workflow.trace, 'WorkflowService - restoreWorkflow - workflow'],
			};
		}

		if (workflow.createdBy !== userId) {
			return {
				userMessage: 'User does not have access to this workflow!',
				error: 'User does not have access to this workflow!',
				errorType: 'UnauthorizedException',
				errorData: { workflowId },
				trace: ['WorkflowService - restoreWorkflow - if (workflow.createdBy !== userId)'],
			};
		}

		let fileName = workflow.title;

		const workflowExistsWithSameNameForTheUser = await this.WorkflowModel.findOne({
			title: workflow.title,
			createdBy: workflow.createdBy,
			status: { $ne: 'deleted' },
		})
			.lean()
			.exec();

		if (workflowExistsWithSameNameForTheUser) fileName = `${workflow.title} (${Date.now()})`;

		const response = await this.WorkflowModel.findOneAndUpdate(
			{ id: workflowId },
			{ title: fileName, status: 'inactive', updateTime: Date.now() },
			{ new: true },
		)
			.lean()
			.exec();
		if (!response) {
			return {
				userMessage: 'Error restoring workflow!',
				error: 'Error restoring workflow!',
				errorType: 'InternalServerErrorException',
				errorData: { workflowId },
				trace: ['WorkflowService - restoreWorkflow - if (!response)'],
			};
		}

		return true;
	}

	/**
	 * Get public workflow data
	 */
	async getPublicWorkflowData(workflows: WorkflowType[]): Promise<DefaultReturnType<PublicWorkflowType[]>> {
		try {
			const updatedWorkflows = [] as PublicWorkflowType[];

			for (const workflow of workflows) {
				const updatedWorkflow = { ...workflow } as { [key: string]: any };

				const creator = await this.userService.getUser({ id: workflow.createdBy });
				if (isError(creator)) {
					return {
						...creator,
						trace: [...creator.trace, 'WorkflowService - getPublicWorkflowData - creator'],
					};
				}

				omittedWorkflowFields.forEach((field) => delete updatedWorkflow[field]);

				updatedWorkflow['creator'] = {
					name: `${creator.firstName} ${creator.lastName}`,
					username: creator.username,
					image: creator.image || '',
				};
				updatedWorkflow['report'] = {
					successExecutions: workflow.report.filter((execution) => execution.executionStatus === 'success')
						.length,
					failedExecutions: workflow.report.filter((execution) => execution.executionStatus === 'failed')
						.length,
				};

				updatedWorkflows.push(updatedWorkflow as PublicWorkflowType);
			}

			return updatedWorkflows;
		} catch (error) {
			return {
				userMessage: 'Error delivering public workflow data!',
				error: 'Error delivering public workflow data!',
				errorType: 'InternalServerErrorException',
				errorData: {
					workflows,
					error: returnErrorString(error),
				},
				trace: ['WorkflowService - getPublicWorkflowData - catch (error)'],
			};
		}
	}

	/**
	 * Get user global mission stats
	 */
	async getUserGlobalMissionStats(userId: string): Promise<DefaultReturnType<{ totalExecutions: number }>> {
		const user = await this.userService.getUser({ id: userId });
		if (isError(user)) {
			return {
				...user,
				trace: [...user.trace, 'WorkflowService - getUserGlobalMissionStats - this.userService.getUser'],
			};
		}

		const allWorkflows = await this.getUserWorkflows(user.id);
		if (isError(allWorkflows)) {
			return {
				...allWorkflows,
				trace: [...allWorkflows.trace, 'WorkflowService - getUserGlobalMissionStats - allWorkflows'],
			};
		}

		return { totalExecutions: allWorkflows.length };
	}

	/**
	 * Permanently delete old workflows
	 */
	async permanentlyDeleteOldWorkflows(): Promise<DefaultReturnType<true>> {
		const sevenDaysAgo = Date.now() - 7 * TIME.DAY_IN_MS;

		const response = await this.WorkflowModel.deleteMany({
			updateTime: { $lt: sevenDaysAgo },
			status: 'deleted',
		}).exec();
		if (!response) {
			return {
				userMessage: 'Error deleting old workflows!',
				error: 'Error deleting old workflows!',
				errorType: 'InternalServerErrorException',
				errorData: {},
				trace: ['WorkflowService - permanentlyDeleteOldWorkflows - this.WorkflowModel.deleteMany'],
			};
		}

		return true;
	}

	private async checkTriggers({
		userId,
		data,
	}: {
		userId: string;
		data: WorkflowType;
	}): Promise<DefaultReturnType<true>> {
		if (!data.nodes) return true;

		const nodes = data.nodes;
		const config = data.config;

		const workflowHasTelegramTrigger = nodes.find((node: NodeType) => node.type === 'telegram-trigger');
		if (!workflowHasTelegramTrigger) return true;

		const telegramConfig = config[workflowHasTelegramTrigger.id];
		if (!telegramConfig) return true;

		const accessToken = telegramConfig.accessToken;
		if (!accessToken) return true;

		const triggerData = await this.workflowTriggersService.getTrigger(accessToken);
		if (isError(triggerData)) {
			return {
				...triggerData,
				trace: [...triggerData.trace, 'WorkflowService - checkTriggers - triggerData'],
			};
		}

		const telegramTriggerExists = triggerData.length > 0 ? triggerData[0] : null;

		if (telegramTriggerExists && telegramTriggerExists.workflowId !== data.id) {
			const workflow = await this.getWorkflow({ userId, workflowId: telegramTriggerExists.workflowId });
			if (isError(workflow)) {
				return {
					...workflow,
					trace: [...workflow.trace, 'WorkflowService - checkTriggers - workflowName'],
				};
			}

			return {
				userMessage: `Telegram trigger with same access token already exists! Mission: (${workflow.title})`,
				error: `Telegram trigger with same access token already exists! Mission: (${workflow.title})`,
				errorType: 'ConflictException',
				errorData: { data },
				trace: [
					'WorkflowService - checkTriggers - if (telegramTriggerExists && telegramTriggerExists.workflowId !== data.id)',
				],
			};
		}

		if (!telegramTriggerExists) {
			await this.workflowTriggersService.addTrigger({
				content: accessToken,
				type: workflowHasTelegramTrigger.type,
				nodeId: workflowHasTelegramTrigger.id,
				workflowId: data.id,
			});
		}

		return true;
	}

	/**
	 * Delete triggers
	 */
	private async deleteTriggers(data: Record<string, any>): Promise<DefaultReturnType<true>> {
		if (!data.nodes) return true;

		const nodes = (data.nodes as NodeType[]) || [];
		const nodeIds = nodes.map((node) => node.id);

		const triggersByWorkflowId = await this.workflowTriggersService.getTriggersByWorkflowId(data.id);
		if (isError(triggersByWorkflowId)) {
			return {
				...triggersByWorkflowId,
				trace: [...triggersByWorkflowId.trace, 'WorkflowService - deleteTriggers - triggersByWorkflowId'],
			};
		}

		for (const trigger of triggersByWorkflowId) {
			if (nodeIds.includes(trigger.nodeId)) continue;

			const response = await this.workflowTriggersService.deleteTrigger(trigger.content);
			if (isError(response)) {
				return {
					...response,
					trace: [...response.trace, 'WorkflowService - deleteTriggers - response'],
				};
			}
		}

		return true;
	}

	private async workflowHasInteractTrigger(props: {
		userId: string | undefined;
		workflow: WorkflowType;
	}): Promise<DefaultReturnType<true>> {
		const { userId, workflow } = props;

		const interactNode = workflow.nodes.find((node) => node.type === 'interact-trigger');
		const interactExists = await this.workflowInteractionService.interactExists(workflow.id);

		if (!interactNode) {
			if (!interactExists) return true;

			const response = await this.workflowInteractionService.deleteInteract({
				userId,
				workflowId: workflow.id,
			});

			if (isError(response)) {
				return {
					...response,
					trace: [...response.trace, 'WorkflowService - workflowHasInteractTrigger - response'],
				};
			}

			return true;
		}

		if (interactExists) return true;

		if (userId) {
			const response = await this.workflowInteractionService.createInteract({ userId, workflow });
			if (isError(response)) {
				return {
					...response,
					trace: [...response.trace, 'WorkflowService - workflowHasInteractTrigger - response'],
				};
			}
		}

		return true;
	}
}
