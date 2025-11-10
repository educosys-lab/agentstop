import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CacheUtilModule } from './shared/cache/cache.module';
import { MemoryCacheModule } from './shared/cache/memory-cache.module';
import { GlobalModule } from './shared/global/global.module';
import { QueueModule } from './shared/queue/queue.module';

import { UserModule } from './user/user.module';
import { WorkflowModule } from './workflow/workflow.module';
import { AuthModule } from './auth/auth.module';
import { RequestContextModule } from './shared/context/request-context.module';
import { RequestContextMiddleware } from './shared/context/request-context.middleware';
import { AuthUserIdMiddleware } from './auth/auth-userid.middleware';
import { InteractModule } from './interact/interact.module';
import { WorkflowSystemModule } from './workflow-system/workflow-system.module';
import { WebSocketModule } from './shared/websocket/websocket.module';
import { SecurityModule } from './shared/security/security.module';
import { DetectMiddleware } from './shared/middlewares/detect.middleware';
import { TemplateModule } from './template/template.module';
import { WebhookModule } from './shared/webhook/webhook.module';
import { CampaignDataModule } from './campaign/campaign-data/campaign.module';
import { CampaignMessagesModule } from './campaign/campaign-message/whatsapp-campaign.module';
import { CampaignAnalyticsModule } from './campaign/campaign-analytics/campaign-analytics.module';
import { RagModule } from './rag/rag.module';
import { DelayedResponseModule } from './shared/delayed-response/delayed-response.module';
import { FileModule } from './shared/upload/file.module';
import { NgrokController } from './shared/ngrok/ngrok.controller';
import { StaticModule } from './shared/static/static.module';

@Module({
	imports: [
		ConfigModule.forRoot({ isGlobal: true }),
		MongooseModule.forRoot(process.env.MONGODB_URI || ''),
		ScheduleModule.forRoot(),
		MemoryCacheModule,
		CacheUtilModule,
		QueueModule,
		GlobalModule,
		WebSocketModule,
		WebhookModule,
		FileModule,
		StaticModule,
		SecurityModule,
		AuthModule,
		RequestContextModule,
		DelayedResponseModule,
		UserModule,
		InteractModule,
		WorkflowModule,
		WorkflowSystemModule,
		TemplateModule,
		CampaignDataModule,
		CampaignMessagesModule,
		CampaignAnalyticsModule,
		RagModule,
	],
	controllers: [AppController, NgrokController],
	providers: [AppService],
})
export class AppModule implements NestModule {
	configure(consumer: MiddlewareConsumer) {
		consumer.apply(DetectMiddleware).forRoutes('*');
		consumer
			.apply(AuthUserIdMiddleware, RequestContextMiddleware)
			.exclude(
				{ path: '/', method: RequestMethod.GET },

				{ path: '/admin/key', method: RequestMethod.GET },

				{ path: '/auth/signin', method: RequestMethod.POST },
				{ path: '/auth/signup', method: RequestMethod.POST },
				{ path: '/auth/refresh', method: RequestMethod.GET },
				{ path: '/auth/logout', method: RequestMethod.GET },

				{ path: '/assets/*', method: RequestMethod.GET },

				{ path: '/user', method: RequestMethod.GET },
				{ path: '/user/otp', method: RequestMethod.GET },
				{ path: '/user/verify', method: RequestMethod.POST },
				{ path: '/user/reset-password', method: RequestMethod.POST },

				{ path: '/ngrok/*', method: RequestMethod.POST },
				{ path: '/webhook/google-sheets/:workflowId/:triggerNodeId', method: RequestMethod.POST },
				{ path: '/webhook/telegram/:token', method: RequestMethod.POST },
				{ path: '/webhook/whatsapp/:workflowId/:triggerNodeId', method: RequestMethod.GET },
				{ path: '/webhook/whatsapp/:workflowId/:triggerNodeId', method: RequestMethod.POST },
				{ path: '/webhook/whatsapp-tool/:workflowId/:nodeId', method: RequestMethod.GET },
				{ path: '/webhook/whatsapp-tool/:workflowId/:nodeId', method: RequestMethod.POST },
				{ path: '/webhook/whatsapp-tool/:workflowId/:nodeId/send-message', method: RequestMethod.POST },
				{ path: '/webhook/:workflowId', method: RequestMethod.POST },

				{ path: '/template/all', method: RequestMethod.GET },

				{ path: '/user/id', method: RequestMethod.GET },
			)
			.forRoutes('*');
		consumer.apply(RequestContextMiddleware).forRoutes('*');
	}
}
