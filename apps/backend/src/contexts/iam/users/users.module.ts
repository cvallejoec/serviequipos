import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DbUser } from '../../../database/entities/DbUser';
import { USER_REPOSITORY } from './domain/UserRepository';
import { TypeOrmUserRepository } from './infrastructure/TypeOrmUserRepository';
import { GoogleAuthUserHandler } from './application/google-auth-user/GoogleAuthUserHandler';
import { ChangeUserAvatarCommandHandler } from './application/avatar-changer/ChangeUserAvatarCommandHandler';
import { UpdateUserProfileCommandHandler } from './application/updater/UpdateUserProfileCommandHandler';
import { CompleteProfileCommandHandler } from './application/profile-completer/CompleteProfileCommandHandler';
import { LookupUsersByIdsQueryHandler } from './application/finder/LookupUsersByIdsQueryHandler';
import { FindUserByIdQueryHandler } from './application/finder/FindUserByIdQueryHandler';
import { UserProfileCompletedBackfillService } from './infrastructure/UserProfileCompletedBackfillService';
import { EMAIL_SENDER } from '../shared/domain/EmailSender';
import { SendGridEmailSender } from '../shared/infrastructure/SendGridEmailSender';

@Module({
  imports: [TypeOrmModule.forFeature([DbUser])],
  providers: [
    { provide: USER_REPOSITORY, useClass: TypeOrmUserRepository },
    { provide: EMAIL_SENDER, useClass: SendGridEmailSender },
    GoogleAuthUserHandler,
    ChangeUserAvatarCommandHandler,
    UpdateUserProfileCommandHandler,
    CompleteProfileCommandHandler,
    LookupUsersByIdsQueryHandler,
    FindUserByIdQueryHandler,
    UserProfileCompletedBackfillService,
  ],
  exports: [
    GoogleAuthUserHandler,
    ChangeUserAvatarCommandHandler,
    UpdateUserProfileCommandHandler,
    CompleteProfileCommandHandler,
    LookupUsersByIdsQueryHandler,
    FindUserByIdQueryHandler,
    { provide: USER_REPOSITORY, useClass: TypeOrmUserRepository },
  ],
})
export class UsersModule {}
