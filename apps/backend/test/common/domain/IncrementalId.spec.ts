import { IncrementalId } from '../../../src/common/domain/IncrementalId';
import { InvalidArgumentError } from '../../../src/common/domain/InvalidArgumentError';

describe('IncrementalId', () => {
  it.each([0, 1, 42, 1000])('acepta el entero no negativo %s', (valid) => {
    expect(new IncrementalId(valid).value).toBe(valid);
  });

  it.each([-1, -100])('rechaza el valor negativo %s', (invalid) => {
    expect(() => new IncrementalId(invalid)).toThrow(InvalidArgumentError);
  });

  it('rechaza un valor no entero', () => {
    expect(() => new IncrementalId(1.5)).toThrow(InvalidArgumentError);
  });

  describe('empty / isEmpty', () => {
    it('empty() crea un IncrementalId con valor 0', () => {
      expect(IncrementalId.empty().value).toBe(0);
    });

    it('isEmpty() es true cuando el valor es 0', () => {
      expect(IncrementalId.empty().isEmpty()).toBe(true);
      expect(new IncrementalId(0).isEmpty()).toBe(true);
    });

    it('isEmpty() es false cuando el valor es mayor que 0', () => {
      expect(new IncrementalId(1).isEmpty()).toBe(false);
    });
  });
});
