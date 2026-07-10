import { UserEmailVerified } from '../../../../../src/contexts/iam/users/domain/value-objects/UserEmailVerified';

describe('UserEmailVerified', () => {
  it('acepta el valor booleano recibido', () => {
    expect(new UserEmailVerified(true).value).toBe(true);
    expect(new UserEmailVerified(false).value).toBe(false);
  });

  it('verified() representa un correo verificado', () => {
    expect(UserEmailVerified.verified().value).toBe(true);
  });

  it('unverified() representa un correo sin verificar', () => {
    expect(UserEmailVerified.unverified().value).toBe(false);
  });
});
