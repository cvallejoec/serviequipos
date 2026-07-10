import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CLOCK, Clock } from '../../../../../common/domain';
import { USER_REPOSITORY, UserRepository } from '../../domain/UserRepository';
import { UserId } from '../../domain/value-objects/UserId';
import { UserFirstName } from '../../domain/value-objects/UserFirstName';
import { UserLastName } from '../../domain/value-objects/UserLastName';
import { UserPhone } from '../../domain/value-objects/UserPhone';
import { UserGender } from '../../domain/value-objects/UserGender';
import { UserBirthday } from '../../domain/value-objects/UserBirthday';
import { UpdateUserProfileCommand } from './UpdateUserProfileCommand';
import { User } from '../../domain/User';

@Injectable()
export class UpdateUserProfileCommandHandler {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    @Inject(CLOCK)
    private readonly clock: Clock,
  ) {}

  async execute(command: UpdateUserProfileCommand): Promise<User> {
    const user = await this.userRepository.findById(new UserId(command.userId));
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    user.completeProfile(
      {
        firstName: new UserFirstName(command.firstName),
        lastName: new UserLastName(command.lastName),
        phone: new UserPhone(command.phone),
        gender: new UserGender(command.gender as never),
        birthday: UserBirthday.fromString(command.birthday),
      },
      this.clock,
    );

    await this.userRepository.save(user);
    return user;
  }
}
