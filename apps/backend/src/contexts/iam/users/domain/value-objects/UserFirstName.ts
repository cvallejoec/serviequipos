import {
  InvalidArgumentError,
  StringValueObject,
} from '../../../../../common/domain';

export class UserFirstName extends StringValueObject {
  private static readonly MIN_LENGTH = 2;
  private static readonly MAX_LENGTH = 100;

  constructor(value: string) {
    super(value.trim());
    this.ensureIsValid();
  }

  private ensureIsValid(): void {
    if (this.value.length < UserFirstName.MIN_LENGTH) {
      throw new InvalidArgumentError(
        `El nombre debe tener al menos ${UserFirstName.MIN_LENGTH} caracteres`,
      );
    }
    if (this.value.length > UserFirstName.MAX_LENGTH) {
      throw new InvalidArgumentError(
        `El nombre no puede superar ${UserFirstName.MAX_LENGTH} caracteres`,
      );
    }
  }
}
