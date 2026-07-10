import { StringValueObject } from '../../../src/common/domain/StringValueObject';
import { InvalidArgumentError } from '../../../src/common/domain/InvalidArgumentError';

describe('StringValueObject', () => {
  it.each(['texto', '', '  con espacios  '])(
    'acepta el valor de cadena "%s"',
    (valid) => {
      expect(new StringValueObject(valid).value).toBe(valid);
    },
  );

  it.each([null, undefined])('rechaza el valor %s', (invalid) => {
    expect(() => new StringValueObject(invalid as never)).toThrow(
      InvalidArgumentError,
    );
  });

  it('dos cadenas iguales son equivalentes', () => {
    expect(new StringValueObject('a').equals(new StringValueObject('a'))).toBe(
      true,
    );
  });
});
