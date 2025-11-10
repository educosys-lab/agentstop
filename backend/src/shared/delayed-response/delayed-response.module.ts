import { Global, Module } from '@nestjs/common';

import { DelayedResponseService } from './delayed-response.service';

/**
 * @summary Delayed response module
 * @description Module for delayed response functionality
 */
@Global()
@Module({
	providers: [DelayedResponseService],
	exports: [DelayedResponseService],
})
export class DelayedResponseModule {}
