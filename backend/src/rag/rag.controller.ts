import { Controller, Delete, Get, Post, Query, Body } from '@nestjs/common';

import { RagService } from './rag.service';
import { Public } from 'src/auth/public.decorator';
import { log } from 'src/shared/logger/logger';
import { isError, throwError } from 'src/shared/utils/error.util';
import { UserId } from 'src/auth/user-id.decorator';
import { UserService } from 'src/user/user.service';
import { RagIngestionType } from './rag.type';

/**
 * @summary Rag controller
 * @description Controller for rag operations
 * @routes
 * - /rag/user - GET
 * - /rag - POST
 * - /rag - DELETE
 *
 * @private
 * - verifyUserId
 */
@Controller('/rag')
export class RagController {
	constructor(
		private readonly ragService: RagService,
		private readonly userService: UserService,
	) {}

	/**
	 * Get user rag source names
	 */
	@Public()
	@Get('/user')
	async getUserRagSourceNames(@UserId() userId: string): Promise<string[]> {
		await this.verifyUserId(userId);

		const ragData = await this.ragService.getUserRagData(userId);
		if (isError(ragData)) {
			log(userId, 'error', {
				message: ragData.error,
				data: ragData.errorData,
				trace: [...ragData.trace, 'RagController - getUserRagSourceNames - this.ragService.getUserRagData'],
			});
			throwError({ error: ragData.userMessage, errorType: ragData.errorType });
		}

		const sourceNames = ragData.map((rag) => rag.sourceName);
		return sourceNames;
	}

	/**
	 * RAG ingestion
	 */
	@Post('/ingestion')
	async ragIngestion(@UserId() userId: string, @Body() data: RagIngestionType): Promise<string[]> {
		await this.verifyUserId(userId);

		const ragIngestionResponse = await this.ragService.ragIngestion({ userId, data });
		if (isError(ragIngestionResponse)) {
			log(userId, 'error', {
				message: ragIngestionResponse.error,
				data: ragIngestionResponse.errorData,
				trace: [...ragIngestionResponse.trace, 'RagController - ragIngestion - this.ragService.ragIngestion'],
			});
			throwError({ error: ragIngestionResponse.userMessage, errorType: ragIngestionResponse.errorType });
		}

		const addRagSourceResponse = await this.ragService.addRagSource({ userId, sourceName: data.sourceName });
		if (isError(addRagSourceResponse)) {
			log(userId, 'error', {
				message: addRagSourceResponse.error,
				data: addRagSourceResponse.errorData,
				trace: [...addRagSourceResponse.trace, 'RagController - addRagSource - this.ragService.addRagSource'],
			});
			throwError({ error: addRagSourceResponse.userMessage, errorType: addRagSourceResponse.errorType });
		}

		const allUserRagsSourceNames = addRagSourceResponse.map((rag) => rag.sourceName);

		return allUserRagsSourceNames;
	}

	/**
	 * Add rag source
	 */
	@Post('/user/add-source')
	async addRagSource(@UserId() userId: string, @Query('sourceName') sourceName: string): Promise<string[]> {
		await this.verifyUserId(userId);

		const addRagSourceResponse = await this.ragService.addRagSource({ userId, sourceName });
		if (isError(addRagSourceResponse)) {
			log(userId, 'error', {
				message: addRagSourceResponse.error,
				data: addRagSourceResponse.errorData,
				trace: [...addRagSourceResponse.trace, 'RagController - addRagSource - this.ragService.addRagSource'],
			});
			throwError({ error: addRagSourceResponse.userMessage, errorType: addRagSourceResponse.errorType });
		}

		const allUserRagsSourceNames = addRagSourceResponse.map((rag) => rag.sourceName);

		return allUserRagsSourceNames;
	}

	/**
	 * Delete rag source
	 */
	@Delete('/')
	async deleteRagSource(@UserId() userId: string, @Query('sourceName') sourceName: string): Promise<true> {
		await this.verifyUserId(userId);

		const deleteRagSourceResponse = await this.ragService.deleteRagSource({ userId, sourceName });
		if (isError(deleteRagSourceResponse)) {
			log(userId, 'error', {
				message: deleteRagSourceResponse.error,
				data: deleteRagSourceResponse.errorData,
				trace: [
					...deleteRagSourceResponse.trace,
					'RagController - deleteRagSource - this.ragService.deleteRagSource',
				],
			});
			throwError({ error: deleteRagSourceResponse.userMessage, errorType: deleteRagSourceResponse.errorType });
		}

		return true;
	}

	/**
	 * Verify user id
	 */
	private async verifyUserId(userId: string | undefined): Promise<true> {
		if (!userId) {
			log('rag', 'error', {
				message: 'User is unauthorized!',
				data: {},
				trace: ['RagController - verifyUserId - if (!userId)'],
			});
			throwError({ error: 'User is unauthorized!', errorType: 'UnauthorizedException' });
		}

		const user = await this.userService.getUser({ id: userId });
		if (isError(user)) {
			log(userId, 'error', {
				message: user.error,
				data: user.errorData,
				trace: [...user.trace, 'RagController - verifyUserId - this.userService.getUser'],
			});
			throwError({ error: user.userMessage, errorType: user.errorType });
		}

		return true;
	}
}
