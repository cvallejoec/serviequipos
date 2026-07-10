import { InvalidArgumentError } from './InvalidArgumentError';
import { IntegerValueObject } from './IntegerValueObject';

export class IncrementalId extends IntegerValueObject {
  constructor(value: number) {
    super(value);
    this.ensureIsGreaterOrEqualThanZero();
  }

  static empty(): IncrementalId {
    return new IncrementalId(0);
  }

  private ensureIsGreaterOrEqualThanZero(): void {
    if (this.value < 0) {
      throw new InvalidArgumentError(
        'IncrementalId must be greater than or equal to 0',
      );
    }
  }

  isEmpty(): boolean {
    return this.value === 0;
  }
}
