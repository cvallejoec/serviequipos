import { User } from './User';
import { UserEmail } from './value-objects/UserEmail';
import { UserId } from './value-objects/UserId';

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');

export interface UserRepository {
  save(user: User): Promise<void>;
  findById(id: UserId): Promise<User | null>;
  findByIds(ids: UserId[]): Promise<User[]>;
  findByEmail(email: UserEmail): Promise<User | null>;
  existsByEmail(email: UserEmail): Promise<boolean>;
  delete(id: UserId): Promise<void>;
}
