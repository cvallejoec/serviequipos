import { Inject, Injectable } from '@nestjs/common';
import { USER_REPOSITORY, UserRepository } from '../../domain/UserRepository';
import { UserId } from '../../domain/value-objects/UserId';
import { User } from '../../domain/User';
import { LookupUsersByIdsQuery } from './LookupUsersByIdsQuery';

@Injectable()
export class LookupUsersByIdsQueryHandler {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}

  async execute(query: LookupUsersByIdsQuery): Promise<User[]> {
    return this.userRepository.findByIds(query.ids.map((id) => new UserId(id)));
  }
}
