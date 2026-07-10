import { IntegerValueObject } from '../../../src/common/domain/IntegerValueObject';
import { InvalidArgumentError } from '../../../src/common/domain/InvalidArgumentError';

describe('IntegerValueObject', () => {
  it.each([0, 1, -7, 1000])('acepta el entero %s', (valid) => {
    expect(new IntegerValueObject(valid).value).toBe(valid);
  });

  it.each([3.14, -0.5, 0.1, NaN, Infinity])(
    'rechaza el valor no entero %s',
    (invalid) => {
      expect(() => new IntegerValueObject(invalid)).toThrow(
        InvalidArgumentError,
      );
    },
  );

  it('el mensaje de error menciona el valor recibido', () => {
    expect(() => new IntegerValueObject(2.5)).toThrow(
      /El valor <2.5> no es un número entero válido/,
    );
  });

  it.each([null, undefined])('rechaza el valor %s', (invalid) => {
    expect(() => new IntegerValueObject(invalid as never)).toThrow(
      InvalidArgumentError,
    );
  });
});
