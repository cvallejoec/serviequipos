import { UserId } from '../../../../../src/contexts/iam/users/domain/value-objects/UserId';
import { InvalidArgumentError } from '../../../../../src/common/domain/InvalidArgumentError';

describe('UserId', () => {
  it('acepta un CUID válido', () => {
    const value = UserId.random().value;
    expect(new UserId(value).value).toBe(value);
  });

  it('random() genera un CUID con formato válido', () => {
    expect(UserId.random().value).toMatch(/^c[a-z0-9]{24}$/);
  });

  it('rechaza un valor con formato inválido', () => {
    expect(() => new UserId('no-es-cuid')).toThrow(InvalidArgumentError);
  });

  it('dos IDs con el mismo valor son iguales', () => {
    const value = UserId.random().value;
    expect(new UserId(value).equals(new UserId(value))).toBe(true);
  });
});
