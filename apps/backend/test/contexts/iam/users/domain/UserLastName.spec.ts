import { UserLastName } from '../../../../../src/contexts/iam/users/domain/value-objects/UserLastName';
import { InvalidArgumentError } from '../../../../../src/common/domain/InvalidArgumentError';

describe('UserLastName', () => {
  it('acepta un apellido con longitud válida', () => {
    expect(new UserLastName('Lovelace').value).toBe('Lovelace');
  });

  it('recorta los espacios en los extremos', () => {
    expect(new UserLastName('  Lovelace  ').value).toBe('Lovelace');
  });

  it('acepta el apellido en el límite mínimo (2 caracteres)', () => {
    expect(new UserLastName('Li').value).toBe('Li');
  });

  it('acepta el apellido en el límite máximo (100 caracteres)', () => {
    const name = 'a'.repeat(100);
    expect(new UserLastName(name).value).toBe(name);
  });

  it('rechaza un apellido demasiado corto', () => {
    expect(() => new UserLastName('L')).toThrow(InvalidArgumentError);
  });

  it('rechaza un apellido que tras recortar queda demasiado corto', () => {
    expect(() => new UserLastName('  L  ')).toThrow(InvalidArgumentError);
  });

  it('rechaza un apellido demasiado largo', () => {
    expect(() => new UserLastName('a'.repeat(101))).toThrow(
      InvalidArgumentError,
    );
  });
});
