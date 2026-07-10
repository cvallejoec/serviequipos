import { Module } from '@nestjs/common';
import { UsersModule } from '../../contexts/iam/users/users.module';
import { AuthModule } from '../../contexts/iam/auth/auth.module';
import { OtpModule } from '../../contexts/iam/otp/otp.module';
import { PlatformModule } from '../../contexts/platform/platform.module';
import { UsersController } from './controllers/UsersController';
import { AuthController } from './controllers/AuthController';
import { MeController } from './controllers/MeController';

@Module({
  imports: [PlatformModule, UsersModule, AuthModule, OtpModule],
  controllers: [UsersController, AuthController, MeController],
})
export class V1Module {}
