import { Inject, Injectable } from '@nestjs/common';
import { USER_REPOSITORY, UserRepository } from '../../domain/UserRepository';
import { UserId } from '../../domain/value-objects/UserId';
import { UserNotFound } from '../../domain/errors/UserNotFound';
import { User } from '../../domain/User';
import { FindUserByIdQuery } from './FindUserByIdQuery';

@Injectable()
export class FindUserByIdQueryHandler {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}

  async execute(query: FindUserByIdQuery): Promise<User> {
    const user = await this.userRepository.findById(new UserId(query.userId));
    if (!user) throw new UserNotFound(query.userId);
    return user;
  }
}
