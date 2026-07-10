import { Inject, Injectable } from '@nestjs/common';
import { CLOCK, Clock, Id } from '../../../../../common/domain';
import { User } from '../../../users/domain/User';
import { UserEmail } from '../../../users/domain/value-objects/UserEmail';
import { UserFirstName } from '../../../users/domain/value-objects/UserFirstName';
import { UserId } from '../../../users/domain/value-objects/UserId';
import { UserLastName } from '../../../users/domain/value-objects/UserLastName';
import {
  USER_REPOSITORY,
  UserRepository,
} from '../../../users/domain/UserRepository';
import { VerifyOtpQueryHandler } from '../../../otp/application/verifier/VerifyOtpQueryHandler';
import { VerifyOtpQuery } from '../../../otp/application/verifier/VerifyOtpQuery';
import { AuthenticateByOtpCommand } from './AuthenticateByOtpCommand';

@Injectable()
export class AuthenticateByOtpCommandHandler {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    private readonly verifyOtpHandler: VerifyOtpQueryHandler,
    @Inject(CLOCK)
    private readonly clock: Clock,
  ) {}

  async execute(command: AuthenticateByOtpCommand): Promise<User> {
    await this.verifyOtpHandler.execute(
      new VerifyOtpQuery(command.email, command.code),
    );

    const email = new UserEmail(command.email);
    const existing = await this.userRepository.findByEmail(email);
    if (existing) return existing;

    const user = User.create(
      {
        id: new UserId(Id.random().value),
        firstName: new UserFirstName('Usuario'),
        lastName: new UserLastName('Nuevo'),
        email,
        emailVerified: true,
      },
      this.clock,
    );

    await this.userRepository.save(user);

    return user;
  }
}
