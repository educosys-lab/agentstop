import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { GlobalProvider } from './global.provider';

@Global()
@Module({
	imports: [ConfigModule],
	providers: [GlobalProvider],
	exports: [GlobalProvider],
})
export class GlobalModule {}
