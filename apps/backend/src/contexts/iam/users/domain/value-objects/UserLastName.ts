import {
  InvalidArgumentError,
  StringValueObject,
} from '../../../../../common/domain';

export class UserLastName extends StringValueObject {
  private static readonly MIN_LENGTH = 2;
  private static readonly MAX_LENGTH = 100;

  constructor(value: string) {
    super(value.trim());
    this.ensureIsValid();
  }

  private ensureIsValid(): void {
    if (this.value.length < UserLastName.MIN_LENGTH) {
      throw new InvalidArgumentError(
        `El apellido debe tener al menos ${UserLastName.MIN_LENGTH} caracteres`,
      );
    }
    if (this.value.length > UserLastName.MAX_LENGTH) {
      throw new InvalidArgumentError(
        `El apellido no puede superar ${UserLastName.MAX_LENGTH} caracteres`,
      );
    }
  }
}
