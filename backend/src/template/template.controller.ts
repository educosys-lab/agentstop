import { Body, Controller, Delete, Get, Patch, Post, Query } from '@nestjs/common';

import { TemplateService } from './template.service';
import { Public } from 'src/auth/public.decorator';
import { AddTemplateType, GetTemplateType, UpdateTemplateType } from './template.type';
import { log } from 'src/shared/logger/logger';
import { isError, throwError } from 'src/shared/utils/error.util';
import { UserId } from 'src/auth/user-id.decorator';

/**
 * @summary Template controller
 * @description Controller for handling template routes
 * @routes
 * - /template/all - GET - Public
 * - /template - POST
 * - /template - PATCH
 * - /template - DELETE
 * - /template/use - POST
 *
 * @private
 * - verifyUserId
 */
@Controller('/template')
export class TemplateController {
	constructor(private readonly templateService: TemplateService) {}

	/**
	 * Get all templates
	 */
	@Public()
	@Get('/all')
	async getAllTemplates(): Promise<GetTemplateType[]> {
		const allTemplates = await this.templateService.getAllTemplates();
		if (isError(allTemplates)) {
			log('template', 'error', {
				message: allTemplates.error,
				data: allTemplates.errorData,
				trace: [...allTemplates.trace, 'TemplateController - getAllTemplates'],
			});
			throwError({ error: allTemplates.userMessage, errorType: allTemplates.errorType });
		}

		return allTemplates.map((template) => {
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const { nodes, edges, ...rest } = template;
			return rest;
		});
	}

	/**
	 * Add a template
	 */
	@Post('/')
	async addTemplate(@UserId() userId: string, @Body() props: AddTemplateType): Promise<true> {
		await this.verifyUserId(userId);

		const addTemplateResponse = await this.templateService.addTemplate(props);
		if (isError(addTemplateResponse)) {
			log(userId, 'error', {
				message: addTemplateResponse.error,
				data: addTemplateResponse.errorData,
				trace: [...addTemplateResponse.trace, 'TemplateController - addTemplate'],
			});
			throwError({ error: addTemplateResponse.userMessage, errorType: addTemplateResponse.errorType });
		}

		return true;
	}

	/**
	 * Update a template
	 */
	@Patch('/')
	async updateTemplate(
		@UserId() userId: string,
		@Query('id') id: string,
		@Body() props: UpdateTemplateType,
	): Promise<true> {
		await this.verifyUserId(userId);

		const updateTemplateResponse = await this.templateService.updateTemplate({ id, updates: props });
		if (isError(updateTemplateResponse)) {
			log(userId, 'error', {
				message: updateTemplateResponse.error,
				data: updateTemplateResponse.errorData,
				trace: [...updateTemplateResponse.trace, 'TemplateController - updateTemplate'],
			});
			throwError({
				error: updateTemplateResponse.userMessage,
				errorType: updateTemplateResponse.errorType,
			});
		}

		return true;
	}

	/**
	 * Delete a template
	 */
	@Delete('/')
	async deleteTemplate(@UserId() userId: string, @Query('id') id: string): Promise<true> {
		await this.verifyUserId(userId);

		const deleteTemplateResponse = await this.templateService.deleteTemplate(id);
		if (isError(deleteTemplateResponse)) {
			log(userId, 'error', {
				message: deleteTemplateResponse.error,
				data: deleteTemplateResponse.errorData,
				trace: [...deleteTemplateResponse.trace, 'TemplateController - deleteTemplate'],
			});
			throwError({
				error: deleteTemplateResponse.userMessage,
				errorType: deleteTemplateResponse.errorType,
			});
		}

		return true;
	}

	/**
	 * Use a template
	 */
	@Post('/use')
	async useTemplate(@UserId() userId: string, @Query('id') templateId: string): Promise<string> {
		await this.verifyUserId(userId);

		const useTemplateResponse = await this.templateService.useTemplate({ userId, templateId });
		if (isError(useTemplateResponse)) {
			log(userId, 'error', {
				message: useTemplateResponse.error,
				data: useTemplateResponse.errorData,
				trace: [...useTemplateResponse.trace, 'TemplateController - useTemplate'],
			});
			throwError({ error: useTemplateResponse.userMessage, errorType: useTemplateResponse.errorType });
		}

		return useTemplateResponse;
	}

	/**
	 * Verify user id
	 */
	private async verifyUserId(userId: string | undefined): Promise<true> {
		if (!userId) {
			log('template', 'error', {
				message: 'User is unauthorized!',
				data: {},
				trace: ['TemplateController - verifyUserId - if (!userId)'],
			});
			throwError({ error: 'User is unauthorized!', errorType: 'UnauthorizedException' });
		}

		return true;
	}
}
