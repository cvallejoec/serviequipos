import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { DbOtpCode } from '../../../database/entities/DbOtpCode';
import { OTP_CODE_REPOSITORY } from './domain/OtpCodeRepository';
import { TypeOrmOtpCodeRepository } from './infrastructure/TypeOrmOtpCodeRepository';
import { EMAIL_SENDER } from '../shared/domain/EmailSender';
import { SendGridEmailSender } from '../shared/infrastructure/SendGridEmailSender';
import { RequestOtpCommandHandler } from './application/request/RequestOtpCommandHandler';
import { VerifyOtpQueryHandler } from './application/verifier/VerifyOtpQueryHandler';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([DbOtpCode]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: config.get<string>('JWT_EXPIRES_IN', '7d') as never,
        },
      }),
    }),
    UsersModule,
  ],
  providers: [
    { provide: OTP_CODE_REPOSITORY, useClass: TypeOrmOtpCodeRepository },
    { provide: EMAIL_SENDER, useClass: SendGridEmailSender },
    RequestOtpCommandHandler,
    VerifyOtpQueryHandler,
  ],
  exports: [RequestOtpCommandHandler, VerifyOtpQueryHandler],
})
export class OtpModule {}
