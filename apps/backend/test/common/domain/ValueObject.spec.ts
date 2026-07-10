import { ValueObject } from '../../../src/common/domain/ValueObject';
import { InvalidArgumentError } from '../../../src/common/domain/InvalidArgumentError';

// Subclase de prueba para ejercitar la clase base abstracta.
class TestStringVO extends ValueObject<string> {}
class OtraStringVO extends ValueObject<string> {}

describe('ValueObject', () => {
  it('expone el valor recibido', () => {
    expect(new TestStringVO('hola').value).toBe('hola');
  });

  it.each([null, undefined])(
    'lanza InvalidArgumentError cuando el valor es %s',
    (invalid) => {
      expect(() => new TestStringVO(invalid as never)).toThrow(
        InvalidArgumentError,
      );
    },
  );

  it('incluye el nombre de la subclase en el mensaje de error', () => {
    expect(() => new TestStringVO(null as never)).toThrow(
      /TestStringVO El valor debe estar definido/,
    );
  });

  describe('equals', () => {
    it('dos value objects del mismo tipo y valor son iguales', () => {
      expect(new TestStringVO('a').equals(new TestStringVO('a'))).toBe(true);
    });

    it('mismo tipo pero distinto valor no son iguales', () => {
      expect(new TestStringVO('a').equals(new TestStringVO('b'))).toBe(false);
    });

    it('mismo valor pero distinto tipo no son iguales', () => {
      expect(new TestStringVO('a').equals(new OtraStringVO('a'))).toBe(false);
    });
  });

  describe('toString', () => {
    it('delega en el toString del valor subyacente', () => {
      expect(new TestStringVO('valor').toString()).toBe('valor');
    });
  });
});
