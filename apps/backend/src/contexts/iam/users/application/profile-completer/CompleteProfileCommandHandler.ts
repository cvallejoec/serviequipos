import { Inject, Injectable } from '@nestjs/common';
import { CLOCK, Clock } from '../../../../../common/domain';
import { UserNotFound } from '../../domain/errors/UserNotFound';
import { USER_REPOSITORY, UserRepository } from '../../domain/UserRepository';
import { UserId } from '../../domain/value-objects/UserId';
import { UserFirstName } from '../../domain/value-objects/UserFirstName';
import { UserLastName } from '../../domain/value-objects/UserLastName';
import { UserPhone } from '../../domain/value-objects/UserPhone';
import { User } from '../../domain/User';
import { CompleteProfileCommand } from './CompleteProfileCommand';

@Injectable()
export class CompleteProfileCommandHandler {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    @Inject(CLOCK)
    private readonly clock: Clock,
  ) {}

  async execute(command: CompleteProfileCommand): Promise<User> {
    const user = await this.userRepository.findById(new UserId(command.userId));
    if (!user) throw new UserNotFound(command.userId);

    user.completeProfile(
      {
        firstName: new UserFirstName(command.firstName),
        lastName: new UserLastName(command.lastName),
        phone: new UserPhone(command.phone),
      },
      this.clock,
    );

    await this.userRepository.save(user);

    return user;
  }
}
