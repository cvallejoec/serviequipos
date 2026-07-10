import { UserFirstName } from '../../../../../src/contexts/iam/users/domain/value-objects/UserFirstName';
import { InvalidArgumentError } from '../../../../../src/common/domain/InvalidArgumentError';

describe('UserFirstName', () => {
  it('acepta un nombre con longitud válida', () => {
    expect(new UserFirstName('Ada').value).toBe('Ada');
  });

  it('recorta los espacios en los extremos', () => {
    expect(new UserFirstName('  Ada  ').value).toBe('Ada');
  });

  it('acepta el nombre en el límite mínimo (2 caracteres)', () => {
    expect(new UserFirstName('Al').value).toBe('Al');
  });

  it('acepta el nombre en el límite máximo (100 caracteres)', () => {
    const name = 'a'.repeat(100);
    expect(new UserFirstName(name).value).toBe(name);
  });

  it('rechaza un nombre demasiado corto', () => {
    expect(() => new UserFirstName('A')).toThrow(InvalidArgumentError);
  });

  it('rechaza un nombre que tras recortar queda demasiado corto', () => {
    expect(() => new UserFirstName('  A  ')).toThrow(InvalidArgumentError);
  });

  it('rechaza un nombre demasiado largo', () => {
    expect(() => new UserFirstName('a'.repeat(101))).toThrow(
      InvalidArgumentError,
    );
  });
});
