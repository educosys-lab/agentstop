import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { v4 as uuid } from 'uuid';
import axios from 'axios';

import { RagIngestionType, RagType } from './rag.type';
import { log } from 'src/shared/logger/logger';
import { DefaultReturnType } from 'src/shared/types/return.type';
import { isError } from 'src/shared/utils/error.util';

/**
 * @summary Rag service
 * @description Service for rag operations
 * @functions
 * - getUserRagData
 * - addRagSource
 * - deleteRagSource
 */
@Injectable()
export class RagService {
	constructor(@InjectModel('Rag') private RagModel: Model<RagType>) {}

	/**
	 * Get user rag data
	 */
	async getUserRagData(userId: string): Promise<DefaultReturnType<RagType[]>> {
		const rag = await this.RagModel.find({ userId });
		if (isError(rag)) {
			log('rag', 'error', {
				message: rag.error,
				data: rag.errorData,
				trace: [...rag.trace, 'RagService - getUserRagData - this.getRagData'],
			});
		}

		return rag;
	}

	/**
	 * RAG ingestion
	 */
	async ragIngestion({ userId, data }: { userId: string; data: RagIngestionType }): Promise<DefaultReturnType<true>> {
		try {
			const ingestionData: Record<string, unknown> = {
				source_type: data.sourceType,
				data: data.data,
				source_name: `${userId}::${data.sourceName}`,
			};

			if (data.sourceType === 'url') {
				ingestionData.crawl_full_website = data.crawlFullWebsite;
			}

			await axios.post(`${process.env.PYTHON_BACKEND_URL}/rag/ingest`, ingestionData);

			return true;
		} catch {
			return {
				userMessage: 'RAG ingestion failed!',
				error: 'RAG ingestion failed!',
				errorType: 'InternalServerErrorException',
				errorData: { ...data },
				trace: [`RagService - ragIngestion - axios.post`, 'RagService - ragIngestion - catch'],
			};
		}
	}

	/**
	 * Add rag source
	 */
	async addRagSource(props: { userId: string; sourceName: string }): Promise<DefaultReturnType<RagType[]>> {
		const { userId, sourceName } = props;

		const rag = await this.RagModel.create({ id: uuid(), userId, sourceName });
		if (!rag) {
			return {
				userMessage: 'Rag data not found!',
				error: 'Rag data not found!',
				errorType: 'InternalServerErrorException',
				errorData: {},
				trace: [`RagService - addRagSource - this.RagModel.create`],
			};
		}

		const allUserRags = await this.getUserRagData(userId);
		if (isError(allUserRags)) {
			return {
				...allUserRags,
				trace: [...allUserRags.trace, 'RagService - addRagSource - this.getUserRagData'],
			};
		}

		return allUserRags;
	}

	/**
	 * Delete rag source
	 */
	async deleteRagSource(props: { userId: string; sourceName: string }): Promise<DefaultReturnType<true>> {
		const { userId, sourceName } = props;

		await axios.delete(`${process.env.PYTHON_BACKEND_URL}/rag/documents/${userId}::${sourceName}`);

		const rag = await this.RagModel.findOneAndDelete({ userId, sourceName });
		if (!rag) {
			return {
				userMessage: 'Rag data not found!',
				error: 'Rag data not found!',
				errorType: 'InternalServerErrorException',
				errorData: {},
				trace: [`RagService - deleteRagSource - this.RagModel.findOneAndDelete`],
			};
		}

		return true;
	}
}
