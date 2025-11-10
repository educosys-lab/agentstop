import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { CampaignMessageService } from './whatsapp-campaign.service';
import { CampaignMessageController } from './whatsapp-campaign.controller';
import { CampaignMessageSchema } from './whatsapp-campaign.schema';

@Module({
	imports: [MongooseModule.forFeature([{ name: 'CampaignMessages', schema: CampaignMessageSchema }])],
	controllers: [CampaignMessageController],
	providers: [CampaignMessageService],
	exports: [CampaignMessageService],
})
export class CampaignMessagesModule {}
