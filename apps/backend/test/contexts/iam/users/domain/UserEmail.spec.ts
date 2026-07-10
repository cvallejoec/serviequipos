import { UserEmail } from '../../../../../src/contexts/iam/users/domain/value-objects/UserEmail';
import { InvalidArgumentError } from '../../../../../src/common/domain/InvalidArgumentError';

describe('UserEmail', () => {
  it('acepta un correo con formato válido', () => {
    const email = new UserEmail('persona@example.com');
    expect(email.value).toBe('persona@example.com');
  });

  it('normaliza a minúsculas y recorta espacios', () => {
    const email = new UserEmail('  Persona@Example.COM  ');
    expect(email.value).toBe('persona@example.com');
  });

  it.each(['sin-arroba', 'a@b', 'a@b.', '@example.com', 'espacio @x.com', ''])(
    'rechaza el correo inválido "%s"',
    (invalid) => {
      expect(() => new UserEmail(invalid)).toThrow(InvalidArgumentError);
    },
  );

  it('dos correos con el mismo valor son iguales', () => {
    expect(new UserEmail('a@b.com').equals(new UserEmail('A@B.com'))).toBe(
      true,
    );
  });
});
