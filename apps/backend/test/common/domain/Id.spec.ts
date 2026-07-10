import { Id } from '../../../src/common/domain/Id';
import { Cuid } from '../../../src/common/domain/Cuid';
import { InvalidArgumentError } from '../../../src/common/domain/InvalidArgumentError';

describe('Id', () => {
  it('acepta un CUID con formato válido', () => {
    const valor = Id.random().value;
    expect(new Id(valor).value).toBe(valor);
  });

  it('rechaza un valor con formato inválido', () => {
    expect(() => new Id('no-es-un-cuid')).toThrow(InvalidArgumentError);
  });

  describe('random', () => {
    it('genera un Id (subclase de Cuid) con formato válido', () => {
      const id = Id.random();
      expect(id).toBeInstanceOf(Id);
      expect(id).toBeInstanceOf(Cuid);
      expect(/^c[a-z0-9]{24}$/.test(id.value)).toBe(true);
    });

    it('genera valores distintos en llamadas sucesivas', () => {
      expect(Id.random().value).not.toBe(Id.random().value);
    });
  });
});
