import {
  InvalidArgumentError,
  StringValueObject,
} from '../../../../../common/domain';

export class UserPhone extends StringValueObject {
  constructor(value: string) {
    super(value);
    this.ensureIsValidPhone(value);
  }

  private ensureIsValidPhone(value: string): void {
    const phoneRegex = /^\+[1-9]\d{7,14}$/;
    if (!phoneRegex.test(value)) {
      throw new InvalidArgumentError(
        `El número de teléfono <${value}> no tiene un formato válido`,
      );
    }
  }
}
