import { Module } from '@nestjs/common';

import { InteractService } from './interact.service';
import { UserModule } from 'src/user/user.module';
import { WorkflowModule } from 'src/workflow/workflow.module';
import { InteractModelModule } from './interact-model.module';
import { InteractController } from './interact.controller';

@Module({
	imports: [InteractModelModule, UserModule, WorkflowModule],
	controllers: [InteractController],
	providers: [InteractService],
	exports: [InteractService],
})
export class InteractModule {}
