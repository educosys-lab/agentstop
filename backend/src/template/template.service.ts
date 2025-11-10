import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { v4 as uuid } from 'uuid';

import { AddTemplateType, TemplateType, UpdateTemplateType } from './template.type';
import { WorkflowService } from 'src/workflow/workflow.service';
import { loadNodeClass } from 'src/workflow-system/workflow-system.util';
import { validate } from 'src/shared/utils/zod.util';
import { DefaultReturnType } from 'src/shared/types/return.type';
import {
	addTemplateValidation,
	deleteTemplateValidation,
	updateTemplateValidation,
	useTemplateValidation,
} from './template.validate';
import { isError } from 'src/shared/utils/error.util';

/**
 * @summary Template service
 * @description Service for handling template operations
 * @functions
 * - getAllTemplates
 * - addTemplate
 * - updateTemplate
 * - deleteTemplate
 * - useTemplate
 *
 * @private
 * - getTemplate
 */
@Injectable()
export class TemplateService {
	constructor(
		@InjectModel('Template') private TemplateModel: Model<TemplateType>,

		private readonly workflowService: WorkflowService,
	) {}

	/**
	 * Get all templates
	 */
	async getAllTemplates(): Promise<DefaultReturnType<TemplateType[]>> {
		const templates = await this.TemplateModel.find().lean().exec();
		if (!templates) {
			return {
				userMessage: 'Unable to get templates!',
				error: 'Unable to get templates!',
				errorType: 'InternalServerErrorException',
				errorData: {},
				trace: ['TemplateService - getAllTemplates - this.TemplateModel.find()'],
			};
		}

		return templates;
	}

	/**
	 * Add a template
	 */
	async addTemplate(props: AddTemplateType): Promise<DefaultReturnType<true>> {
		const validationResult = validate({ data: props, schema: addTemplateValidation });
		if (isError(validationResult)) {
			return {
				...validationResult,
				trace: [...validationResult.trace, 'TemplateService - addTemplate - validate'],
			};
		}

		const { nodes } = validationResult;

		const newTemplate: Partial<TemplateType> = validationResult;
		newTemplate.id = uuid();
		newTemplate.viewed = 0;
		newTemplate.used = 0;

		const uniqueNodes = nodes.filter((node, index, self) => index === self.findIndex((n) => n.type === node.type));

		const nodeIcons: string[] = [];
		for (const node of uniqueNodes) {
			const nodeClass = await loadNodeClass({ type: node.type, category: 'all' });
			if (!isError(nodeClass)) nodeIcons.push(nodeClass.metadata.icon);
		}

		newTemplate.icons = nodeIcons;

		const response = await this.TemplateModel.create(newTemplate).then((template: any) => template._doc);
		if (!response) {
			return {
				userMessage: 'Unable to create template!',
				error: 'Unable to create template!',
				errorType: 'InternalServerErrorException',
				errorData: { props },
				trace: ['TemplateService - addTemplate - create'],
			};
		}

		return true;
	}

	/**
	 * Update a template
	 */
	async updateTemplate(props: { id: string; updates: UpdateTemplateType }): Promise<DefaultReturnType<true>> {
		const validationResult = validate({ data: props, schema: updateTemplateValidation });
		if (isError(validationResult)) {
			return {
				...validationResult,
				trace: [...validationResult.trace, 'TemplateService - updateTemplate - validate'],
			};
		}

		const { id, updates } = validationResult;

		const response = await this.TemplateModel.findOneAndUpdate({ id }, { $set: updates }, { new: true });
		if (!response) {
			return {
				userMessage: 'Unable to update template!',
				error: `Unable to update template with id ${id}!`,
				errorType: 'InternalServerErrorException',
				errorData: { id, props: updates },
				trace: ['TemplateService - updateTemplate - findOneAndUpdate'],
			};
		}

		return true;
	}

	/**
	 * Delete a template
	 */
	async deleteTemplate(templateId: string): Promise<DefaultReturnType<true>> {
		const validationResult = validate({ data: { templateId }, schema: deleteTemplateValidation });
		if (isError(validationResult)) {
			return {
				...validationResult,
				trace: [...validationResult.trace, 'TemplateService - deleteTemplate - validate'],
			};
		}

		const response = await this.TemplateModel.findOneAndDelete({ id: validationResult.templateId });
		if (!response) {
			return {
				userMessage: 'Unable to delete template!',
				error: `Unable to delete template with id ${templateId}!`,
				errorType: 'InternalServerErrorException',
				errorData: { templateId },
				trace: ['TemplateService - deleteTemplate - findOneAndDelete'],
			};
		}

		return true;
	}

	/**
	 * Use a template
	 */
	async useTemplate(props: { userId: string; templateId: string }): Promise<DefaultReturnType<string>> {
		const validationResult = validate({ data: props, schema: useTemplateValidation });
		if (isError(validationResult)) {
			return {
				...validationResult,
				trace: [...validationResult.trace, 'TemplateService - useTemplate - validate'],
			};
		}

		const { userId, templateId } = validationResult;

		const selectedTemplate = await this.getTemplate(templateId);
		if (isError(selectedTemplate)) {
			return {
				...selectedTemplate,
				trace: [...selectedTemplate.trace, 'TemplateService - useTemplate - getTemplate'],
			};
		}

		const createdWorkflow = await this.workflowService.createWorkflowWithTemplate({
			userId,
			template: selectedTemplate,
		});
		if (isError(createdWorkflow)) {
			return {
				...createdWorkflow,
				trace: [...createdWorkflow.trace, 'TemplateService - useTemplate - createWorkflowWithTemplate'],
			};
		}

		return createdWorkflow;
	}

	/**
	 * Get a template
	 */
	private async getTemplate(templateId: string): Promise<DefaultReturnType<TemplateType>> {
		const template = await this.TemplateModel.findOne({ id: templateId }).lean().exec();
		if (!template) {
			return {
				userMessage: 'Template not found!',
				error: `Template with id ${templateId} not found!`,
				errorType: 'NotFoundException',
				errorData: { templateId },
				trace: ['TemplateService - getTemplate - findOne'],
			};
		}

		await this.TemplateModel.updateOne({ id: templateId }, { viewed: template.viewed + 1 });
		return template;
	}
}
