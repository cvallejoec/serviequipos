import {
  InvalidArgumentError,
  StringValueObject,
} from '../../../../../common/domain';

export class UserEmail extends StringValueObject {
  private static readonly EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  constructor(value: string) {
    super(value.toLowerCase().trim());
    this.ensureIsValidEmail();
  }

  private ensureIsValidEmail(): void {
    if (!UserEmail.EMAIL_REGEX.test(this.value)) {
      throw new InvalidArgumentError(
        `El correo electrónico <${this.value}> no tiene un formato válido`,
      );
    }
  }
}
