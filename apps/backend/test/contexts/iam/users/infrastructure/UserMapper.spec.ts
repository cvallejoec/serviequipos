import { UserMapper } from '../../../../../src/contexts/iam/users/infrastructure/UserMapper';
import { DbUser } from '../../../../../src/database/entities/DbUser';
import { UserStatusEnum } from '../../../../../src/contexts/iam/users/domain/value-objects/UserStatus';
import { UserGenderEnum } from '../../../../../src/contexts/iam/users/domain/value-objects/UserGender';
import { UserBuilder } from '../../../../builders/UserBuilder';

describe('UserMapper', () => {
  const buildDbUser = (overrides: Partial<DbUser> = {}): DbUser => {
    const dbUser = new DbUser();
    dbUser.id = UserBuilder.aUser().build().toPrimitives().id;
    dbUser.firstName = 'Ada';
    dbUser.lastName = 'Lovelace';
    dbUser.email = 'ada@example.com';
    dbUser.status = UserStatusEnum.ACTIVE;
    dbUser.avatar = 'https://cdn.test/avatars/foto.webp';
    dbUser.phone = '+593987654321';
    dbUser.gender = UserGenderEnum.FEMALE;
    dbUser.birthday = new Date('1990-05-20T12:00:00.000Z');
    dbUser.emailVerified = true;
    dbUser.phoneVerified = true;
    dbUser.profileCompleted = true;
    dbUser.createdAt = new Date('2026-01-01T00:00:00.000Z');
    dbUser.updatedAt = new Date('2026-01-02T00:00:00.000Z');
    return Object.assign(dbUser, overrides);
  };

  describe('toDomain', () => {
    it('mapea una entidad completa a un agregado equivalente', () => {
      const dbUser = buildDbUser();

      const primitives = UserMapper.toDomain(dbUser).toPrimitives();

      expect(primitives.id).toBe(dbUser.id);
      expect(primitives.firstName).toBe('Ada');
      expect(primitives.email).toBe('ada@example.com');
      expect(primitives.status).toBe('ACTIVE');
      expect(primitives.avatar).toBe('https://cdn.test/avatars/foto.webp');
      expect(primitives.phone.toPrimitive()).toBe('+593987654321');
      expect(primitives.gender.toPrimitive()).toBe('FEMALE');
      expect(primitives.birthday.toPrimitive()).toEqual(dbUser.birthday);
      expect(primitives.emailVerified).toBe(true);
      expect(primitives.profileCompleted).toBe(true);
    });

    it('mapea los campos opcionales nulos a Maybe vacíos', () => {
      const dbUser = buildDbUser({
        avatar: null,
        phone: null,
        gender: null,
        birthday: null,
        profileCompleted: false,
      });

      const primitives = UserMapper.toDomain(dbUser).toPrimitives();

      expect(primitives.avatar).toBeNull();
      expect(primitives.phone.toPrimitive()).toBeNull();
      expect(primitives.gender.toPrimitive()).toBeNull();
      expect(primitives.birthday.toPrimitive()).toBeNull();
    });
  });

  describe('toPersistence', () => {
    it('mapea un agregado a una entidad DbUser', () => {
      const user = UserBuilder.aCompletedUser()
        .withFirstName('Grace')
        .withLastName('Hopper')
        .withGender('FEMALE')
        .withBirthday(new Date('1985-03-10T12:00:00.000Z'))
        .withAvatar('https://cdn.test/avatars/foto.webp')
        .build();

      const dbUser = UserMapper.toPersistence(user);
      const primitives = user.toPrimitives();

      expect(dbUser).toBeInstanceOf(DbUser);
      expect(dbUser.id).toBe(primitives.id);
      expect(dbUser.firstName).toBe('Grace');
      expect(dbUser.status).toBe('ACTIVE');
      expect(dbUser.phone).toBe('+593987654321');
      expect(dbUser.gender).toBe('FEMALE');
      expect(dbUser.birthday).toEqual(primitives.birthday.toPrimitive());
      expect(dbUser.emailVerified).toBe(true);
      expect(dbUser.profileCompleted).toBe(true);
    });

    it('convierte los campos opcionales ausentes a null', () => {
      const user = UserBuilder.aUser()
        .withAvatar(null)
        .withPhone(null)
        .withGender(null)
        .withBirthday(null)
        .build();

      const dbUser = UserMapper.toPersistence(user);

      expect(dbUser.avatar).toBeNull();
      expect(dbUser.phone).toBeNull();
      expect(dbUser.gender).toBeNull();
      expect(dbUser.birthday).toBeNull();
    });
  });

  describe('round-trip', () => {
    it('toDomain(toPersistence(user)) conserva los primitivos', () => {
      const original = UserBuilder.aCompletedUser()
        .withGender('MALE')
        .withBirthday(new Date('1990-05-20T12:00:00.000Z'))
        .withAvatar('https://cdn.test/avatars/foto.webp')
        .build();

      const dbUser = UserMapper.toPersistence(original);
      // createdAt/updatedAt los gestiona TypeORM; los fijamos para comparar.
      dbUser.createdAt = original.toPrimitives().createdAt;
      dbUser.updatedAt = original.toPrimitives().updatedAt;

      const roundTripped = UserMapper.toDomain(dbUser).toPrimitives();
      const originalPrimitives = original.toPrimitives();

      expect(roundTripped.id).toBe(originalPrimitives.id);
      expect(roundTripped.email).toBe(originalPrimitives.email);
      expect(roundTripped.avatar).toBe(originalPrimitives.avatar);
      expect(roundTripped.phone.toPrimitive()).toBe(
        originalPrimitives.phone.toPrimitive(),
      );
      expect(roundTripped.gender.toPrimitive()).toBe(
        originalPrimitives.gender.toPrimitive(),
      );
      expect(roundTripped.birthday.toPrimitive()).toEqual(
        originalPrimitives.birthday.toPrimitive(),
      );
      expect(roundTripped.profileCompleted).toBe(
        originalPrimitives.profileCompleted,
      );
    });
  });
});
