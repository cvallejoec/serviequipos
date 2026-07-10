import { Maybe } from '../../../../common/domain';
import { DbUser } from '../../../../database/entities/DbUser';
import { User } from '../domain/User';

export class UserMapper {
  static toDomain(dbUser: DbUser): User {
    return User.fromPrimitives({
      id: dbUser.id,
      firstName: dbUser.firstName,
      lastName: dbUser.lastName,
      email: dbUser.email,
      status: dbUser.status,
      avatar: dbUser.avatar,
      phone: Maybe.fromValue(dbUser.phone),
      gender: Maybe.fromValue(dbUser.gender),
      birthday: Maybe.fromValue(dbUser.birthday),
      emailVerified: dbUser.emailVerified,
      phoneVerified: dbUser.phoneVerified,
      profileCompleted: dbUser.profileCompleted,
      createdAt: dbUser.createdAt,
      updatedAt: dbUser.updatedAt,
    });
  }

  static toPersistence(user: User): DbUser {
    const primitives = user.toPrimitives();
    const dbUser = new DbUser();
    dbUser.id = primitives.id;
    dbUser.firstName = primitives.firstName;
    dbUser.lastName = primitives.lastName;
    dbUser.email = primitives.email;
    dbUser.status = primitives.status as never;
    dbUser.avatar = primitives.avatar;
    dbUser.phone = primitives.phone.toPrimitive() ?? null;
    dbUser.gender = (primitives.gender.toPrimitive() as never) ?? null;
    dbUser.birthday = primitives.birthday.toPrimitive() ?? null;
    dbUser.emailVerified = primitives.emailVerified;
    dbUser.phoneVerified = primitives.phoneVerified;
    dbUser.profileCompleted = primitives.profileCompleted;
    return dbUser;
  }
}
