import { InvalidArgumentError } from './InvalidArgumentError';

export abstract class EnumValueObject<T> {
  constructor(public readonly value: T) {
    this.ensureValueIsValid(value);
  }

  protected abstract validValues(): T[];

  private ensureValueIsValid(value: T): void {
    if (!this.validValues().includes(value)) {
      throw new InvalidArgumentError(
        `El valor <${String(value)}> no es válido. Valores permitidos: ${this.validValues().join(', ')}`,
      );
    }
  }
}
