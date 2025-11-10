import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { TemplateController } from './template.controller';
import { TemplateSchema } from './template.schema';
import { TemplateService } from './template.service';
import { WorkflowModule } from 'src/workflow/workflow.module';

@Module({
	imports: [MongooseModule.forFeature([{ name: 'Template', schema: TemplateSchema }]), WorkflowModule],
	controllers: [TemplateController],
	providers: [TemplateService],
	exports: [],
})
export class TemplateModule {}
