import cuid from 'cuid';
import { InvalidArgumentError } from './InvalidArgumentError';
import { StringValueObject } from './StringValueObject';

export class Cuid extends StringValueObject {
  constructor(value: string) {
    super(value);
    this.ensureFormatIsValid(value);
  }

  public static random(): Cuid {
    return new Cuid(cuid());
  }

  private ensureFormatIsValid(value: string): void {
    const cuidRegExp = /^c[a-z0-9]{24}$/;
    if (!cuidRegExp.test(value)) {
      throw new InvalidArgumentError(
        `El CUID <${value}> no tiene un formato válido`,
      );
    }
  }
}
