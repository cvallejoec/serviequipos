import { EnumValueObject } from '../../../src/common/domain/EnumValueObject';
import { InvalidArgumentError } from '../../../src/common/domain/InvalidArgumentError';

// Subclase de prueba para ejercitar validValues().
type Color = 'ROJO' | 'VERDE' | 'AZUL';

class ColorVO extends EnumValueObject<Color> {
  protected validValues(): Color[] {
    return ['ROJO', 'VERDE', 'AZUL'];
  }
}

describe('EnumValueObject', () => {
  it.each<Color>(['ROJO', 'VERDE', 'AZUL'])(
    'acepta el valor permitido %s',
    (valid) => {
      expect(new ColorVO(valid).value).toBe(valid);
    },
  );

  it.each(['AMARILLO', '', 'rojo'])(
    'rechaza el valor no permitido "%s"',
    (invalid) => {
      expect(() => new ColorVO(invalid as Color)).toThrow(InvalidArgumentError);
    },
  );

  it('el mensaje de error lista los valores permitidos', () => {
    expect(() => new ColorVO('NEGRO' as Color)).toThrow(
      /Valores permitidos: ROJO, VERDE, AZUL/,
    );
  });
});
