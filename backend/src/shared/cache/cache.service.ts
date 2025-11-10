import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

import { DefaultReturnType } from '../types/return.type';
import { TIME } from '../constants/time.constant';
import { returnErrorString } from '../utils/return.util';

/**
 * @summary Cache service
 * @description Service for cache operations
 * @functions
 * - get
 * - set
 * - delete
 * - getTtl
 */
@Injectable()
export class CacheService {
	constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {
		CacheService.instance = this;
	}

	static instance: CacheService;

	/**
	 * Get cache
	 */
	async get<T>(key: string): Promise<DefaultReturnType<T>> {
		try {
			const response = await this.cacheManager.get<T>(key);
			if (!response) {
				return {
					userMessage: 'Internal server error!',
					error: 'Cache not found!',
					errorType: 'NotFoundException',
					errorData: { key },
					trace: ['CacheService - get - this.cacheManager.get'],
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
				trace: ['CacheService - get - catch'],
			};
		}
	}

	/**
	 * Set cache
	 */
	async set(props: {
		key: string;
		data: any;
		ttl?: number | 'infinity'; // Value in milliseconds, 'infinity' means no expiration
	}): Promise<DefaultReturnType<true>> {
		try {
			const { key, data, ttl } = props;

			const finalTtl = ttl === 'infinity' ? undefined : ttl || TIME.MINUTE_IN_MS; // Default to 60 seconds

			const response = await this.cacheManager.set(key, data, finalTtl);
			if (!response) {
				return {
					userMessage: 'Internal server error!',
					error: 'Failed to set cache!',
					errorType: 'InternalServerErrorException',
					errorData: { props },
					trace: ['CacheService - set - this.cacheManager.set'],
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
				trace: ['CacheService - set - catch'],
			};
		}
	}

	/**
	 * Delete cache
	 */
	async delete(key: string): Promise<DefaultReturnType<true>> {
		try {
			await this.cacheManager.del(key);
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
				trace: ['CacheService - delete - this.cacheManager.del'],
			};
		}
	}

	/**
	 * Get cache TTL
	 */
	async getTtl(key: string): Promise<DefaultReturnType<number>> {
		try {
			const ttlInSeconds = await this.cacheManager.ttl(key);
			if (ttlInSeconds === null || ttlInSeconds < 0) {
				return {
					userMessage: 'Internal server error!',
					error: ttlInSeconds === null ? 'Cache key not found!' : 'Cache key has no TTL!',
					errorType: 'InternalServerErrorException',
					errorData: { key },
					trace: ['CacheService - getTtl - this.cacheManager.ttl'],
				};
			}

			return ttlInSeconds * 1000; // Convert seconds to milliseconds
		} catch (error) {
			return {
				userMessage: 'Internal server error!',
				error: 'Error getting cache TTL!',
				errorType: 'InternalServerErrorException',
				errorData: {
					key,
					error: returnErrorString(error),
				},
				trace: ['CacheService - getTtl - catch'],
			};
		}
	}
}
