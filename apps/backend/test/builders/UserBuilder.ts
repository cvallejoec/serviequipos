// Importamos el locale `en` directamente (no el índice, que arrastra TODOS
// los locales). Menos archivos que transpilar => tests más rápidos.
import { faker } from '@faker-js/faker/locale/en';
import { Cuid } from '../../src/common/domain/Cuid';
import { User, UserPrimitives } from '../../src/contexts/iam/users/domain/User';
import { Maybe } from '../../src/common/domain/Maybe';

/**
 * Object mother para `User`. Genera un usuario válido con datos aleatorios
 * (faker) y expone `with*` encadenables para fijar lo que el test necesita.
 *
 * Construye vía `User.fromPrimitives`, así permite estados arbitrarios
 * (perfil completo, verificado, etc.) que la factory `User.create` no cubre.
 */
export class UserBuilder {
  private id: string = Cuid.random().value;
  private firstName = faker.person.firstName();
  private lastName = faker.person.lastName();
  private email = faker.internet.email().toLowerCase();
  private status = 'ACTIVE';
  private avatar: string | null = null;
  private phone: string | null = null;
  private gender: string | null = null;
  private birthday: Date | null = null;
  private emailVerified = false;
  private phoneVerified = false;
  private profileCompleted = false;
  private createdAt: Date = new Date('2026-01-01T00:00:00.000Z');
  private updatedAt: Date = new Date('2026-01-01T00:00:00.000Z');

  static aUser(): UserBuilder {
    return new UserBuilder();
  }

  static aCompletedUser(): UserBuilder {
    return new UserBuilder()
      .withPhone('+593987654321')
      .withProfileCompleted(true)
      .withEmailVerified(true);
  }

  withId(id: string): this {
    this.id = id;
    return this;
  }

  withFirstName(firstName: string): this {
    this.firstName = firstName;
    return this;
  }

  withLastName(lastName: string): this {
    this.lastName = lastName;
    return this;
  }

  withEmail(email: string): this {
    this.email = email.toLowerCase();
    return this;
  }

  withStatus(status: 'ACTIVE' | 'INACTIVE'): this {
    this.status = status;
    return this;
  }

  withAvatar(avatar: string | null): this {
    this.avatar = avatar;
    return this;
  }

  withPhone(phone: string | null): this {
    this.phone = phone;
    return this;
  }

  withGender(gender: string | null): this {
    this.gender = gender;
    return this;
  }

  withBirthday(birthday: Date | null): this {
    this.birthday = birthday;
    return this;
  }

  withEmailVerified(verified: boolean): this {
    this.emailVerified = verified;
    return this;
  }

  withProfileCompleted(completed: boolean): this {
    this.profileCompleted = completed;
    return this;
  }

  buildPrimitives(): UserPrimitives {
    return {
      id: this.id,
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      status: this.status,
      avatar: this.avatar,
      phone: Maybe.fromValue(this.phone),
      gender: Maybe.fromValue(this.gender),
      birthday: Maybe.fromValue(this.birthday),
      emailVerified: this.emailVerified,
      phoneVerified: this.phoneVerified,
      profileCompleted: this.profileCompleted,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  build(): User {
    return User.fromPrimitives(this.buildPrimitives());
  }
}
