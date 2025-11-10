import { Module } from '@nestjs/common';

import { CampaignAnalyticsService } from './campaign-analytics.service';
import { CampaignAnalyticsController } from './campaign-analytics.controller';
import { CampaignDataModule } from '../campaign-data/campaign.module';
import { CampaignMessagesModule } from '../campaign-message/whatsapp-campaign.module';
import { WorkflowModule } from 'src/workflow/workflow.module';

@Module({
	imports: [CampaignDataModule, CampaignMessagesModule, WorkflowModule],
	controllers: [CampaignAnalyticsController],
	providers: [CampaignAnalyticsService],
	exports: [],
})
export class CampaignAnalyticsModule {}
