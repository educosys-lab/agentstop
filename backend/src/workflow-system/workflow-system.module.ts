import { Module } from '@nestjs/common';

import { WorkflowSystemController } from './workflow-system.controller';
import { WorkflowModule } from 'src/workflow/workflow.module';
import { UserModule } from 'src/user/user.module';
import { WorkflowNodeService } from './services/node.service';
import { WorkflowSystemService } from './services/system.service';
import { WorkflowCacheService } from './services/cache.service';
import { WorkflowExecutorService } from './services/executor.service';
import { WorkflowListenersService } from './services/listener.service';
import { WorkflowParserService } from './services/parser.service';
import { WorkflowStartupService } from './services/startup.service';
import { WorkflowTerminatorService } from './services/terminate.service';
import { WorkflowTestService } from './services/test.service';
import { WorkflowUpdateService } from './services/update.service';
import { WorkflowValidatorService } from './services/validator.service';
import { WorkflowSystemWorker } from './workers/workflow-system.worker';
import { WorkflowResponderService } from './services/responder.service';
import { InteractModule } from 'src/interact/interact.module';

@Module({
	imports: [UserModule, WorkflowModule, InteractModule],
	controllers: [WorkflowSystemController],
	providers: [
		WorkflowSystemService,
		WorkflowValidatorService,
		WorkflowParserService,
		WorkflowListenersService,
		WorkflowUpdateService,
		WorkflowExecutorService,
		WorkflowTerminatorService,
		WorkflowTestService,
		WorkflowResponderService,
		WorkflowNodeService,
		WorkflowCacheService,
		WorkflowStartupService,
		WorkflowSystemWorker,
	],
	exports: [WorkflowSystemService],
})
export class WorkflowSystemModule {}
