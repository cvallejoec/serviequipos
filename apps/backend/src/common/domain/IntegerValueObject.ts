import { InvalidArgumentError } from './InvalidArgumentError';
import { NumberValueObject } from './NumberValueObject';

export class IntegerValueObject extends NumberValueObject {
  constructor(value: number) {
    super(value);
    this.ensureIsInteger(value);
  }

  private ensureIsInteger(value: number): void {
    if (!Number.isInteger(value)) {
      throw new InvalidArgumentError(
        `El valor <${value}> no es un número entero válido`,
      );
    }
  }
}
