import { Global, Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { createKeyv } from '@keyv/redis';
import { Keyv } from 'keyv';
import { CacheableMemory } from 'cacheable';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { CacheService } from './cache.service';

@Global()
@Module({
	imports: [
		ConfigModule,
		CacheModule.registerAsync({
			isGlobal: true,
			inject: [ConfigService],
			useFactory: (configService: ConfigService) => {
				return {
					stores: [
						new Keyv({ store: new CacheableMemory({ lruSize: 5000 }) }),
						createKeyv(configService.get<string>('REDIS_CACHE_URL')),
					],
				};
			},
		}),
	],
	providers: [CacheService],
	exports: [CacheService],
})
export class CacheUtilModule {}
