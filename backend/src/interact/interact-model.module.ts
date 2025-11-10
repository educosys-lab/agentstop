import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { InteractSchema } from './interact.schema';

@Module({
	imports: [MongooseModule.forFeature([{ name: 'Interact', schema: InteractSchema }])],
	exports: [MongooseModule],
})
export class InteractModelModule {}
