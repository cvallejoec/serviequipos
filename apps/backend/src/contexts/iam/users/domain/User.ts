import {
  AggregateRoot,
  Clock,
  Maybe,
  TimestampValueObject,
} from '../../../../common/domain';
import { UserAvatar } from './value-objects/UserAvatar';
import { UserBirthday } from './value-objects/UserBirthday';
import { UserEmail } from './value-objects/UserEmail';
import { UserEmailVerified } from './value-objects/UserEmailVerified';
import { UserFirstName } from './value-objects/UserFirstName';
import { UserGender } from './value-objects/UserGender';
import { UserId } from './value-objects/UserId';
import { UserLastName } from './value-objects/UserLastName';
import { UserPhone } from './value-objects/UserPhone';
import { UserPhoneVerified } from './value-objects/UserPhoneVerified';
import { UserProfileCompleted } from './value-objects/UserProfileCompleted';
import { UserStatus } from './value-objects/UserStatus';
import { UserCreatedDomainEvent } from './events/UserCreatedDomainEvent';

export interface UserPrimitives {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  status: string;
  avatar: string | null;
  phone: Maybe<string>;
  gender: Maybe<string>;
  birthday: Maybe<Date>;
  emailVerified: boolean;
  phoneVerified: boolean;
  profileCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface UserConstructorParams {
  id: UserId;
  firstName: UserFirstName;
  lastName: UserLastName;
  email: UserEmail;
  status: UserStatus;
  avatar: Maybe<UserAvatar>;
  phone: Maybe<UserPhone>;
  gender: Maybe<UserGender>;
  birthday: Maybe<UserBirthday>;
  emailVerified: UserEmailVerified;
  phoneVerified: UserPhoneVerified;
  profileCompleted: UserProfileCompleted;
  createdAt: TimestampValueObject;
  updatedAt: TimestampValueObject;
}

export class User extends AggregateRoot {
  private readonly id: UserId;
  private firstName: UserFirstName;
  private lastName: UserLastName;
  private email: UserEmail;
  private status: UserStatus;
  private avatar: Maybe<UserAvatar>;
  private phone: Maybe<UserPhone>;
  private gender: Maybe<UserGender>;
  private birthday: Maybe<UserBirthday>;
  private emailVerified: UserEmailVerified;
  private phoneVerified: UserPhoneVerified;
  private profileCompleted: UserProfileCompleted;
  private readonly createdAt: TimestampValueObject;
  private updatedAt: TimestampValueObject;

  private constructor(params: UserConstructorParams) {
    super();
    this.id = params.id;
    this.firstName = params.firstName;
    this.lastName = params.lastName;
    this.email = params.email;
    this.status = params.status;
    this.avatar = params.avatar;
    this.phone = params.phone;
    this.gender = params.gender;
    this.birthday = params.birthday;
    this.emailVerified = params.emailVerified;
    this.phoneVerified = params.phoneVerified;
    this.profileCompleted = params.profileCompleted;
    this.createdAt = params.createdAt;
    this.updatedAt = params.updatedAt;
  }

  static create(
    params: {
      id: UserId;
      firstName: UserFirstName;
      lastName: UserLastName;
      email: UserEmail;
      emailVerified?: boolean;
      avatar?: UserAvatar | null;
    },
    clock: Clock,
  ): User {
    const now = new TimestampValueObject(clock.now());
    const avatar =
      params.avatar ??
      UserAvatar.fromName(params.firstName.value, params.lastName.value);

    const user = new User({
      id: params.id,
      firstName: params.firstName,
      lastName: params.lastName,
      email: params.email,
      status: UserStatus.active(),
      avatar: Maybe.some(avatar),
      phone: Maybe.none(),
      gender: Maybe.none(),
      birthday: Maybe.none(),
      emailVerified: params.emailVerified
        ? UserEmailVerified.verified()
        : UserEmailVerified.unverified(),
      phoneVerified: UserPhoneVerified.unverified(),
      profileCompleted: UserProfileCompleted.incomplete(),
      createdAt: now,
      updatedAt: now,
    });

    user.record(
      new UserCreatedDomainEvent(user.toPrimitives(), undefined, clock.now()),
    );

    return user;
  }

  static fromPrimitives(primitives: UserPrimitives): User {
    return new User({
      id: new UserId(primitives.id),
      firstName: new UserFirstName(primitives.firstName),
      lastName: new UserLastName(primitives.lastName),
      email: new UserEmail(primitives.email),
      status: new UserStatus(primitives.status as never),
      avatar: Maybe.fromValue(
        primitives.avatar ? new UserAvatar(primitives.avatar) : null,
      ),
      phone: primitives.phone.map((p) => new UserPhone(p)),
      gender: primitives.gender.map((g) => new UserGender(g as never)),
      birthday: primitives.birthday.map((b) => new UserBirthday(b)),
      emailVerified: new UserEmailVerified(primitives.emailVerified),
      phoneVerified: new UserPhoneVerified(primitives.phoneVerified),
      profileCompleted: new UserProfileCompleted(primitives.profileCompleted),
      createdAt: new TimestampValueObject(primitives.createdAt),
      updatedAt: new TimestampValueObject(primitives.updatedAt),
    });
  }

  completeProfile(
    params: {
      firstName: UserFirstName;
      lastName: UserLastName;
      phone: UserPhone;
      gender?: UserGender;
      birthday?: UserBirthday;
    },
    clock: Clock,
  ): void {
    this.firstName = params.firstName;
    this.lastName = params.lastName;
    this.phone = Maybe.some(params.phone);
    if (params.gender) {
      this.gender = Maybe.some(params.gender);
    }
    if (params.birthday) {
      this.birthday = Maybe.some(params.birthday);
    }
    // Si el usuario tiene un avatar real (foto de Google o subida por él),
    // lo respetamos al editar el nombre. Solo regeneramos el default a
    // partir del nuevo nombre si lo que había era el default original.
    if (this.avatar.isEmpty() || this.avatar.get().isAutoGenerated()) {
      this.avatar = Maybe.some(
        UserAvatar.fromName(params.firstName.value, params.lastName.value),
      );
    }
    this.profileCompleted = UserProfileCompleted.completed();
    this.updatedAt = new TimestampValueObject(clock.now());
  }

  /**
   * Cambia el avatar del usuario y devuelve el anterior. El caller
   * decide qué hacer con el anterior — el caso típico es eliminar la
   * imagen del storage si era una subida del usuario.
   */
  changeAvatar(newAvatar: UserAvatar, clock: Clock): Maybe<UserAvatar> {
    const previous = this.avatar;
    this.avatar = Maybe.some(newAvatar);
    this.updatedAt = new TimestampValueObject(clock.now());
    return previous;
  }

  toPrimitives(): UserPrimitives {
    return {
      id: this.id.value,
      firstName: this.firstName.value,
      lastName: this.lastName.value,
      email: this.email.value,
      status: this.status.value,
      avatar: this.avatar.toPrimitive()?.value ?? null,
      phone: this.phone.map((p) => p.value),
      gender: this.gender.map((g) => g.value),
      birthday: this.birthday.map((b) => b.value),
      emailVerified: this.emailVerified.value,
      phoneVerified: this.phoneVerified.value,
      profileCompleted: this.profileCompleted.value,
      createdAt: this.createdAt.value,
      updatedAt: this.updatedAt.value,
    };
  }

  getId(): UserId {
    return this.id;
  }

  getEmail(): UserEmail {
    return this.email;
  }

  isActive(): boolean {
    return this.status.isActive();
  }

  activate(clock: Clock): void {
    this.status = UserStatus.active();
    this.updatedAt = new TimestampValueObject(clock.now());
  }

  deactivate(clock: Clock): void {
    this.status = UserStatus.inactive();
    this.updatedAt = new TimestampValueObject(clock.now());
  }
}
