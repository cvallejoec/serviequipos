import { Cuid } from '../../../src/common/domain/Cuid';
import { InvalidArgumentError } from '../../../src/common/domain/InvalidArgumentError';

describe('Cuid', () => {
  it.each([
    'c' + 'a'.repeat(24),
    'c' + '0123456789abcdefghijklmn', // 24 caracteres tras la 'c'
    Cuid.random().value,
  ])('acepta el CUID con formato válido "%s"', (valid) => {
    expect(new Cuid(valid).value).toBe(valid);
  });

  it.each([
    '', // vacío
    'abc', // no empieza con c ni tiene largo
    'c' + 'a'.repeat(23), // muy corto (24 chars en total)
    'c' + 'a'.repeat(25), // muy largo
    'x' + 'a'.repeat(24), // no empieza con c
    'c' + 'A'.repeat(24), // mayúsculas no permitidas
    'c' + 'a'.repeat(23) + '-', // carácter inválido
  ])('rechaza el CUID inválido "%s"', (invalid) => {
    expect(() => new Cuid(invalid)).toThrow(InvalidArgumentError);
  });

  it('el mensaje de error menciona el valor', () => {
    expect(() => new Cuid('invalido')).toThrow(
      /El CUID <invalido> no tiene un formato válido/,
    );
  });

  describe('random', () => {
    it('genera un Cuid válido', () => {
      const cuid = Cuid.random();
      expect(cuid).toBeInstanceOf(Cuid);
      expect(/^c[a-z0-9]{24}$/.test(cuid.value)).toBe(true);
    });

    it('genera valores distintos en llamadas sucesivas', () => {
      expect(Cuid.random().value).not.toBe(Cuid.random().value);
    });
  });
});
