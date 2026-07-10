import { Maybe } from '../../../src/common/domain/Maybe';

describe('Maybe', () => {
  describe('some / none', () => {
    it('some envuelve un valor definido', () => {
      const maybe = Maybe.some('hola');
      expect(maybe.isDefined()).toBe(true);
      expect(maybe.isEmpty()).toBe(false);
      expect(maybe.get()).toBe('hola');
    });

    it('some lanza error si el valor es null o undefined', () => {
      expect(() => Maybe.some(null as never)).toThrow();
      expect(() => Maybe.some(undefined as never)).toThrow();
    });

    it('none representa la ausencia de valor', () => {
      const maybe = Maybe.none<string>();
      expect(maybe.isEmpty()).toBe(true);
      expect(maybe.isDefined()).toBe(false);
    });
  });

  describe('fromValue', () => {
    it('devuelve some cuando el valor está presente', () => {
      expect(Maybe.fromValue(42).isDefined()).toBe(true);
    });

    it('devuelve none cuando el valor es null o undefined', () => {
      expect(Maybe.fromValue(null).isEmpty()).toBe(true);
      expect(Maybe.fromValue(undefined).isEmpty()).toBe(true);
    });

    it('trata 0 y cadena vacía como valores presentes', () => {
      expect(Maybe.fromValue(0).isDefined()).toBe(true);
      expect(Maybe.fromValue('').isDefined()).toBe(true);
    });
  });

  describe('map / flatMap', () => {
    it('map transforma el valor si está presente', () => {
      expect(
        Maybe.some(2)
          .map((n) => n * 3)
          .get(),
      ).toBe(6);
    });

    it('map sobre none sigue siendo none', () => {
      expect(
        Maybe.none<number>()
          .map((n) => n * 3)
          .isEmpty(),
      ).toBe(true);
    });

    it('flatMap encadena otro Maybe', () => {
      const result = Maybe.some(5).flatMap((n) => Maybe.some(n + 1));
      expect(result.get()).toBe(6);
    });
  });

  describe('getOrElse / getOrThrow / toPrimitive', () => {
    it('getOrElse devuelve el valor si está presente', () => {
      expect(Maybe.some('x').getOrElse('default')).toBe('x');
    });

    it('getOrElse devuelve el default si está vacío', () => {
      expect(Maybe.none<string>().getOrElse('default')).toBe('default');
    });

    it('getOrThrow lanza con el mensaje dado cuando está vacío', () => {
      expect(() => Maybe.none().getOrThrow('vacío!')).toThrow('vacío!');
    });

    it('toPrimitive devuelve el valor o null', () => {
      expect(Maybe.some('v').toPrimitive()).toBe('v');
      expect(Maybe.none().toPrimitive()).toBeNull();
    });
  });

  describe('fold', () => {
    it('ejecuta la rama de valor cuando está presente', () => {
      const result = Maybe.some(10).fold(
        () => 'vacío',
        (n) => `valor:${n}`,
      );
      expect(result).toBe('valor:10');
    });

    it('ejecuta la rama vacía cuando está ausente', () => {
      const result = Maybe.none<number>().fold(
        () => 'vacío',
        (n) => `valor:${n}`,
      );
      expect(result).toBe('vacío');
    });
  });
});
