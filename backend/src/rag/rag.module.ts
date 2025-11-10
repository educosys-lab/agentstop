import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { RagService } from './rag.service';
import { RagController } from './rag.controller';
import { UserModule } from 'src/user/user.module';
import { RagSchema } from './rag.schema';

@Module({
	imports: [MongooseModule.forFeature([{ name: 'Rag', schema: RagSchema }]), UserModule],
	controllers: [RagController],
	providers: [RagService],
})
export class RagModule {}
