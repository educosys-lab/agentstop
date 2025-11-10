import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { WorkflowTriggersSchema } from './workflow-triggers.schema';
import { WorkflowTriggersService } from './workflow-triggers.service';

@Module({
	imports: [MongooseModule.forFeature([{ name: 'WorkflowTrigger', schema: WorkflowTriggersSchema }])],
	providers: [WorkflowTriggersService],
	exports: [WorkflowTriggersService],
})
export class WorkflowTriggersModule {}
