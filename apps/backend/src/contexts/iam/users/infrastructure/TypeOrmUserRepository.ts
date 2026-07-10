import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { User } from '../domain/User';
import { UserEmail } from '../domain/value-objects/UserEmail';
import { UserId } from '../domain/value-objects/UserId';
import { UserRepository } from '../domain/UserRepository';
import { DbUser } from '../../../../database/entities/DbUser';
import { UserMapper } from './UserMapper';

@Injectable()
export class TypeOrmUserRepository implements UserRepository {
  constructor(
    @InjectRepository(DbUser)
    private readonly repository: Repository<DbUser>,
  ) {}

  async save(user: User): Promise<void> {
    const dbUser = UserMapper.toPersistence(user);
    await this.repository.save(dbUser);
  }

  async findById(id: UserId): Promise<User | null> {
    const dbUser = await this.repository.findOne({
      where: { id: id.value },
    });
    return dbUser ? UserMapper.toDomain(dbUser) : null;
  }

  async findByIds(ids: UserId[]): Promise<User[]> {
    if (ids.length === 0) return [];
    const dbUsers = await this.repository.find({
      where: { id: In(ids.map((id) => id.value)) },
    });
    return dbUsers.map(UserMapper.toDomain);
  }

  async findByEmail(email: UserEmail): Promise<User | null> {
    const dbUser = await this.repository.findOne({
      where: { email: email.value },
    });
    return dbUser ? UserMapper.toDomain(dbUser) : null;
  }

  async existsByEmail(email: UserEmail): Promise<boolean> {
    const count = await this.repository.count({
      where: { email: email.value },
    });
    return count > 0;
  }

  async delete(id: UserId): Promise<void> {
    await this.repository.delete({ id: id.value });
  }
}
