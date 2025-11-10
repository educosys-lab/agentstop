import { Global, Module } from '@nestjs/common';

import { RequestContextService } from './request-context.service';
import { ContextDataService } from './context-data.service';

@Global()
@Module({
	providers: [RequestContextService, ContextDataService],
	exports: [RequestContextService, ContextDataService],
})
export class RequestContextModule {}
