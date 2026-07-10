import {
  AggregateRoot,
  Clock,
  Maybe,
  TimestampValueObject,
} from '../../../../common/domain';
import { OtpCodeId } from './value-objects/OtpCodeId';
import { OtpCodeEmail } from './value-objects/OtpCodeEmail';
import { OtpCodeValue } from './value-objects/OtpCodeValue';

export interface OtpCodePrimitives {
  id: string;
  email: string;
  code: string;
  expiresAt: Date;
  usedAt: Maybe<Date>;
  createdAt: Date;
}

interface OtpCodeConstructorParams {
  id: OtpCodeId;
  email: OtpCodeEmail;
  code: OtpCodeValue;
  expiresAt: TimestampValueObject;
  usedAt: Maybe<TimestampValueObject>;
  createdAt: TimestampValueObject;
}

export class OtpCode extends AggregateRoot {
  private readonly id: OtpCodeId;
  private readonly email: OtpCodeEmail;
  private readonly code: OtpCodeValue;
  private readonly expiresAt: TimestampValueObject;
  private usedAt: Maybe<TimestampValueObject>;
  private readonly createdAt: TimestampValueObject;

  private constructor(params: OtpCodeConstructorParams) {
    super();
    this.id = params.id;
    this.email = params.email;
    this.code = params.code;
    this.expiresAt = params.expiresAt;
    this.usedAt = params.usedAt;
    this.createdAt = params.createdAt;
  }

  static create(
    params: {
      id: OtpCodeId;
      email: OtpCodeEmail;
      code: OtpCodeValue;
      ttlMinutes: number;
    },
    clock: Clock,
  ): OtpCode {
    const now = clock.now();
    const expiresAt = new Date(now.getTime() + params.ttlMinutes * 60 * 1000);
    return new OtpCode({
      id: params.id,
      email: params.email,
      code: params.code,
      expiresAt: new TimestampValueObject(expiresAt),
      usedAt: Maybe.none(),
      createdAt: new TimestampValueObject(now),
    });
  }

  static fromPrimitives(primitives: OtpCodePrimitives): OtpCode {
    return new OtpCode({
      id: new OtpCodeId(primitives.id),
      email: new OtpCodeEmail(primitives.email),
      code: new OtpCodeValue(primitives.code),
      expiresAt: new TimestampValueObject(primitives.expiresAt),
      usedAt: primitives.usedAt.map((d) => new TimestampValueObject(d)),
      createdAt: new TimestampValueObject(primitives.createdAt),
    });
  }

  markUsed(clock: Clock): void {
    this.usedAt = Maybe.some(new TimestampValueObject(clock.now()));
  }

  toPrimitives(): OtpCodePrimitives {
    return {
      id: this.id.value,
      email: this.email.value,
      code: this.code.value,
      expiresAt: this.expiresAt.value,
      usedAt: this.usedAt.map((t) => t.value),
      createdAt: this.createdAt.value,
    };
  }
}
