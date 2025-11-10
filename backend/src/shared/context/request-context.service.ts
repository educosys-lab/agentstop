import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';

import { log } from '../logger/logger';
import { DefaultReturnType } from '../types/return.type';
import { returnErrorString } from '../utils/return.util';

/**
 * @summary Request context service
 * @description Service for request context operations
 * @functions
 * - run
 * - get
 * - set
 */
@Injectable()
export class RequestContextService {
	private readonly storage = new AsyncLocalStorage<Map<string, any>>();

	/**
	 * Run request context
	 */
	run(callback: (...args: any[]) => void, initialContext: Record<string, any>): boolean {
		try {
			const store = new Map(Object.entries(initialContext));
			this.storage.run(store, callback);
			return true;
		} catch (error) {
			log('system', 'error', {
				message: 'Error in RequestContextService.run!',
				data: { error: returnErrorString(error) },
				trace: ['RequestContextService - run'],
			});
			return false;
		}
	}

	/**
	 * Get request context
	 */
	get<T>(key: string): DefaultReturnType<T | undefined> {
		try {
			const store = this.storage.getStore();
			return store?.get(key) || undefined;
		} catch (error) {
			return {
				userMessage: 'Internal server error!',
				error: `Failed to get ${key} from context!`,
				errorType: 'InternalServerErrorException',
				errorData: {
					key,
					error: returnErrorString(error),
				},
				trace: ['RequestContextService - get - catch'],
			};
		}
	}

	/**
	 * Set request context
	 */
	set(props: { key: string; value: any }): DefaultReturnType<true> {
		try {
			const { key, value } = props;

			const store = this.storage.getStore();
			store?.set(key, value);
			return true;
		} catch (error) {
			return {
				userMessage: 'Internal server error!',
				error: `Failed to set ${props.key} in context!`,
				errorType: 'InternalServerErrorException',
				errorData: {
					props,
					error: returnErrorString(error),
				},
				trace: ['RequestContextService - set - catch'],
			};
		}
	}
}
