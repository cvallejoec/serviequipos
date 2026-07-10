import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { DbUser } from '../../../src/database/entities/DbUser';
import { DbOtpCode } from '../../../src/database/entities/DbOtpCode';
import { USER_REPOSITORY } from '../../../src/contexts/iam/users/domain/UserRepository';
import { TypeOrmUserRepository } from '../../../src/contexts/iam/users/infrastructure/TypeOrmUserRepository';
import { OTP_CODE_REPOSITORY } from '../../../src/contexts/iam/otp/domain/OtpCodeRepository';
import { TypeOrmOtpCodeRepository } from '../../../src/contexts/iam/otp/infrastructure/TypeOrmOtpCodeRepository';
import { EMAIL_SENDER } from '../../../src/contexts/iam/shared/domain/EmailSender';
import { FILE_STORAGE } from '../../../src/contexts/platform/storage/domain/FileStorage';
import { DOMAIN_EVENT_DISPATCHER } from '../../../src/common/application/DomainEventDispatcher';
import { CLOCK } from '../../../src/common/domain/Clock';
import { SystemClock } from '../../../src/common/domain/SystemClock';
import { FindUserByIdQueryHandler } from '../../../src/contexts/iam/users/application/finder/FindUserByIdQueryHandler';
import { CompleteProfileCommandHandler } from '../../../src/contexts/iam/users/application/profile-completer/CompleteProfileCommandHandler';
import { UpdateUserProfileCommandHandler } from '../../../src/contexts/iam/users/application/updater/UpdateUserProfileCommandHandler';
import { ChangeUserAvatarCommandHandler } from '../../../src/contexts/iam/users/application/avatar-changer/ChangeUserAvatarCommandHandler';
import { GoogleAuthUserHandler } from '../../../src/contexts/iam/users/application/google-auth-user/GoogleAuthUserHandler';
import { RequestOtpCommandHandler } from '../../../src/contexts/iam/otp/application/request/RequestOtpCommandHandler';
import { VerifyOtpQueryHandler } from '../../../src/contexts/iam/otp/application/verifier/VerifyOtpQueryHandler';
import { AuthenticateByOtpCommandHandler } from '../../../src/contexts/iam/auth/application/otp-authenticator/AuthenticateByOtpCommandHandler';
import { NoOpDomainEventDispatcher } from '../../mocks/DomainEventDispatcherMock';
import { createMockEmailSender } from '../../mocks/EmailSenderMock';
import { createMockFileStorage } from '../../mocks/FileStorageMock';
import { testDatabaseConfig } from '../../test-database.module';

/**
 * Módulo de test AISLADO para e2e. Levanta TypeORM contra la base de test y
 * los casos de uso de IAM (+ platform/storage), con DOBLES para todo lo
 * externo: EmailSender (SendGrid), FileStorage (Digital Ocean Spaces) y el
 * dispatcher de eventos. Config y JWT usan valores de test — sin
 * `ConfigModule.validate` ni guardas/throttler globales de `AppModule`.
 *
 * Cada spec importa este módulo, registra los `controllers` que prueba y
 * sobreescribe las guardas de auth. Los dobles se obtienen con
 * `moduleFixture.get(EMAIL_SENDER)` / `get(FILE_STORAGE)` para aseverar.
 *
 * A medida que crezcan los contextos, agrega aquí sus repos/handlers (y la
 * entidad en `test-database.module.ts`).
 */
@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      ignoreEnvFile: true,
      load: [
        () => ({
          FRONTEND_URL: 'http://localhost:3000',
          JWT_SECRET: 'test-secret',
          JWT_EXPIRES_IN: '7d',
        }),
      ],
    }),
    JwtModule.register({
      secret: 'test-secret',
      signOptions: { expiresIn: '7d' },
    }),
    TypeOrmModule.forRoot(testDatabaseConfig),
    TypeOrmModule.forFeature([DbUser, DbOtpCode]),
  ],
  providers: [
    { provide: USER_REPOSITORY, useClass: TypeOrmUserRepository },
    { provide: OTP_CODE_REPOSITORY, useClass: TypeOrmOtpCodeRepository },
    { provide: EMAIL_SENDER, useValue: createMockEmailSender() },
    { provide: FILE_STORAGE, useValue: createMockFileStorage() },
    { provide: DOMAIN_EVENT_DISPATCHER, useClass: NoOpDomainEventDispatcher },
    { provide: CLOCK, useClass: SystemClock },
    FindUserByIdQueryHandler,
    CompleteProfileCommandHandler,
    UpdateUserProfileCommandHandler,
    ChangeUserAvatarCommandHandler,
    GoogleAuthUserHandler,
    RequestOtpCommandHandler,
    VerifyOtpQueryHandler,
    AuthenticateByOtpCommandHandler,
  ],
  exports: [
    JwtModule,
    USER_REPOSITORY,
    OTP_CODE_REPOSITORY,
    EMAIL_SENDER,
    FILE_STORAGE,
    DOMAIN_EVENT_DISPATCHER,
    CLOCK,
    FindUserByIdQueryHandler,
    CompleteProfileCommandHandler,
    UpdateUserProfileCommandHandler,
    ChangeUserAvatarCommandHandler,
    GoogleAuthUserHandler,
    RequestOtpCommandHandler,
    VerifyOtpQueryHandler,
    AuthenticateByOtpCommandHandler,
  ],
})
export class TestAppModule {}
