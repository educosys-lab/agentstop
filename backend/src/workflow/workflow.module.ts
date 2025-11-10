import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { WorkflowController } from './workflow.controller';
import { WorkflowService } from './workflow.service';
import { WorkflowSchema } from './workflow.schema';
import { UserModule } from 'src/user/user.module';
import { WorkflowTriggersModule } from 'src/workflow-triggers/workflow-triggers.module';
import { WorkflowInteractionModule } from 'src/interact/workflow-interaction/workflow-interaction.module';
import { WorkflowPrivateService } from './workflow.private';

@Module({
	imports: [
		MongooseModule.forFeature([{ name: 'Workflow', schema: WorkflowSchema }]),
		UserModule,
		WorkflowTriggersModule,
		WorkflowInteractionModule,
	],
	controllers: [WorkflowController],
	providers: [WorkflowService, WorkflowPrivateService],
	exports: [WorkflowService, WorkflowPrivateService],
})
export class WorkflowModule {}
