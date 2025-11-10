import { Global, Module } from '@nestjs/common';

import { SecurityService } from './security.service';

@Global()
@Module({
	imports: [],
	providers: [SecurityService],
	exports: [SecurityService],
})
export class SecurityModule {}
