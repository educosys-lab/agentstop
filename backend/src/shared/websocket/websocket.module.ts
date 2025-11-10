import { Global, Module } from '@nestjs/common';

import { SocketGateway } from './websocket.gateway';
import { WebSocketService } from './websocket.service';
import { AuthModule } from 'src/auth/auth.module';
import { InteractModule } from 'src/interact/interact.module';
import { InteractSyncService } from './services/interact-sync.service';
import { WorkflowSystemModule } from 'src/workflow-system/workflow-system.module';

@Global()
@Module({
	imports: [AuthModule, InteractModule, WorkflowSystemModule],
	providers: [SocketGateway, WebSocketService, InteractSyncService],
	exports: [WebSocketService],
})
export class WebSocketModule {}
