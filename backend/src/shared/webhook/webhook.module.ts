import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { WebhookController } from './webhook.controller';
import { TelegramWebhookService } from './telegram/telegram-webhook.service';
import { GoogleSheetsWebhookService } from './google-sheets/google-sheets-webhook.service';
import { WhatsAppWebhookService } from './whatsapp/whatsapp-webhook.service';
import { WhatsAppToolWebhookService } from './whatsapp/whatsapp-tool-webhook.service';
import { CampaignDataSchema } from 'src/campaign/campaign-data/campaign.schema';
import { WorkflowModule } from 'src/workflow/workflow.module';
import { CampaignMessageSchema } from 'src/campaign/campaign-message/whatsapp-campaign.schema';
import { WorkflowSystemModule } from 'src/workflow-system/workflow-system.module';
import { WebhookTriggerService } from './webhook-trigger/webhook-trigger.service';

@Global()
@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: 'Campaigns', schema: CampaignDataSchema },
			{ name: 'CampaignMessages', schema: CampaignMessageSchema },
		]),
		WorkflowModule,
		WorkflowSystemModule,
	],
	controllers: [WebhookController],
	providers: [
		TelegramWebhookService,
		GoogleSheetsWebhookService,
		WhatsAppWebhookService,
		WhatsAppToolWebhookService,
		WebhookTriggerService,
	],
	exports: [
		TelegramWebhookService,
		GoogleSheetsWebhookService,
		WhatsAppWebhookService,
		WhatsAppToolWebhookService,
		WebhookTriggerService,
	],
})
export class WebhookModule {}
