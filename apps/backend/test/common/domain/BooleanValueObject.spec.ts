import { BooleanValueObject } from '../../../src/common/domain/BooleanValueObject';
import { InvalidArgumentError } from '../../../src/common/domain/InvalidArgumentError';

describe('BooleanValueObject', () => {
  it.each([true, false])('acepta el valor booleano %s', (valid) => {
    expect(new BooleanValueObject(valid).value).toBe(valid);
  });

  it.each([null, undefined])('rechaza el valor %s', (invalid) => {
    expect(() => new BooleanValueObject(invalid as never)).toThrow(
      InvalidArgumentError,
    );
  });

  it('acepta false (no lo confunde con ausencia de valor)', () => {
    expect(new BooleanValueObject(false).value).toBe(false);
  });
});
