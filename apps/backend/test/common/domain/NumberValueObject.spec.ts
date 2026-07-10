import { NumberValueObject } from '../../../src/common/domain/NumberValueObject';
import { InvalidArgumentError } from '../../../src/common/domain/InvalidArgumentError';

describe('NumberValueObject', () => {
  it.each([0, 1, -5, 3.14, Number.MAX_SAFE_INTEGER])(
    'acepta el valor numérico %s',
    (valid) => {
      expect(new NumberValueObject(valid).value).toBe(valid);
    },
  );

  it.each([null, undefined])('rechaza el valor %s', (invalid) => {
    expect(() => new NumberValueObject(invalid as never)).toThrow(
      InvalidArgumentError,
    );
  });

  it('acepta 0 (no lo confunde con ausencia de valor)', () => {
    expect(new NumberValueObject(0).value).toBe(0);
  });
});
