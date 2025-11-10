import { Injectable } from '@nestjs/common';
import { LRUCache } from 'lru-cache';

import { TIME } from '../constants/time.constant';
import { DefaultReturnType } from '../types/return.type';
import { returnErrorString } from '../utils/return.util';

/**
 * @summary Memory cache service
 * @description Service for memory cache operations
 * @functions
 * - get
 * - set
 * - delete
 */

@Injectable()
export class MemoryCacheService {
	private readonly cache: LRUCache<string, any>;

	constructor() {
		this.cache = new LRUCache<string, any>({
			max: 100,
			ttl: 5 * TIME.MINUTE_IN_MS, // 5 minutes in milliseconds
		});
	}

	/**
	 * Get cache
	 */
	get<T>(key: string): DefaultReturnType<T> {
		try {
			const response = this.cache.get(key);
			if (!response) {
				return {
					userMessage: 'Internal server error!',
					error: 'Cache not found!',
					errorType: 'NotFoundException',
					errorData: { key },
					trace: ['MemoryCacheService - get - this.cache.get'],
				};
			}

			return response;
		} catch (error) {
			return {
				userMessage: 'Internal server error!',
				error: 'Error getting cache!',
				errorType: 'InternalServerErrorException',
				errorData: {
					key,
					error: returnErrorString(error),
				},
				trace: ['MemoryCacheService - get - catch'],
			};
		}
	}

	/**
	 * Set cache
	 */
	set<T>(props: { key: string; value: T }): DefaultReturnType<true> {
		try {
			const { key, value } = props;

			const response = this.cache.set(key, value);
			if (!response) {
				return {
					userMessage: 'Internal server error!',
					error: 'Failed to set cache!',
					errorType: 'InternalServerErrorException',
					errorData: { props },
					trace: ['MemoryCacheService - set - this.cache.set'],
				};
			}

			return true;
		} catch (error) {
			return {
				userMessage: 'Internal server error!',
				error: 'Error setting cache!',
				errorType: 'InternalServerErrorException',
				errorData: {
					props,
					error: returnErrorString(error),
				},
				trace: ['MemoryCacheService - set - catch'],
			};
		}
	}

	/**
	 * Delete cache
	 */
	delete(key: string): DefaultReturnType<true> {
		try {
			this.cache.delete(key);
			return true;
		} catch (error) {
			return {
				userMessage: 'Internal server error!',
				error: 'Error deleting cache!',
				errorType: 'InternalServerErrorException',
				errorData: {
					key,
					error: returnErrorString(error),
				},
				trace: ['MemoryCacheService - delete - this.cache.delete'],
			};
		}
	}
}
