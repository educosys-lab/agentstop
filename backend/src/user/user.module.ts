import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { UserSchema } from './user.schema';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UserPrivateService } from './user.private';

@Module({
	imports: [MongooseModule.forFeature([{ name: 'User', schema: UserSchema }])],
	controllers: [UserController],
	providers: [UserService, UserPrivateService],
	exports: [UserService, UserPrivateService],
})
export class UserModule {}
