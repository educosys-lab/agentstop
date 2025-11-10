import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { CampaignDataService } from './campaign.service';
import { UserModule } from 'src/user/user.module';
import { CampaignDataController } from './campaign.controller';
import { CampaignDataSchema } from './campaign.schema';

@Module({
	imports: [MongooseModule.forFeature([{ name: 'Campaigns', schema: CampaignDataSchema }]), UserModule],
	controllers: [CampaignDataController],
	providers: [CampaignDataService],
	exports: [CampaignDataService],
})
export class CampaignDataModule {}
