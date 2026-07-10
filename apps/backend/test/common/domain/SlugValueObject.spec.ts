import { SlugValueObject } from '../../../src/common/domain/SlugValueObject';
import { InvalidArgumentError } from '../../../src/common/domain/InvalidArgumentError';

describe('SlugValueObject', () => {
  it.each(['hola', 'hola-mundo', 'a1-b2-c3', 'abc123'])(
    'acepta el slug válido "%s"',
    (valid) => {
      expect(new SlugValueObject(valid).value).toBe(valid);
    },
  );

  it.each([
    '', // vacío
    'Hola', // mayúsculas
    'hola mundo', // espacio
    '-hola', // guion inicial
    'hola-', // guion final
    'hola--mundo', // guion doble
    'hola_mundo', // guion bajo
    'holá', // acento
  ])('rechaza el slug inválido "%s"', (invalid) => {
    expect(() => new SlugValueObject(invalid)).toThrow(InvalidArgumentError);
  });

  it('el mensaje de error menciona el slug', () => {
    expect(() => new SlugValueObject('No Valido')).toThrow(
      /Slug <No Valido> no válido/,
    );
  });

  describe('build', () => {
    it.each([
      ['Hola Mundo', 'hola-mundo'],
      ['  Con Espacios  ', 'con-espacios'],
      ['Acentos No Válidos!!', 'acentos-no-v-lidos'],
      ['Multiple   Espacios', 'multiple-espacios'],
      ['---bordes---', 'bordes'],
    ])('slugifica "%s" -> "%s"', (input, expected) => {
      expect(SlugValueObject.build(input).value).toBe(expected);
    });

    it('devuelve una instancia de SlugValueObject', () => {
      expect(SlugValueObject.build('Hola')).toBeInstanceOf(SlugValueObject);
    });
  });

  describe('toString', () => {
    it('devuelve el valor del slug', () => {
      expect(new SlugValueObject('mi-slug').toString()).toBe('mi-slug');
    });
  });
});
