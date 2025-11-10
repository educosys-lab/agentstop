import { Module } from '@nestjs/common';

import { WorkflowInteractionService } from './workflow-interaction.service';
import { UserModule } from 'src/user/user.module';
import { InteractModelModule } from 'src/interact/interact-model.module';

@Module({
	imports: [InteractModelModule, UserModule],
	providers: [WorkflowInteractionService],
	exports: [WorkflowInteractionService],
})
export class WorkflowInteractionModule {}
