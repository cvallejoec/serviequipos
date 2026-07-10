import { UserPhoneVerified } from '../../../../../src/contexts/iam/users/domain/value-objects/UserPhoneVerified';

describe('UserPhoneVerified', () => {
  it('acepta el valor booleano recibido', () => {
    expect(new UserPhoneVerified(true).value).toBe(true);
    expect(new UserPhoneVerified(false).value).toBe(false);
  });

  it('verified() representa un teléfono verificado', () => {
    expect(UserPhoneVerified.verified().value).toBe(true);
  });

  it('unverified() representa un teléfono sin verificar', () => {
    expect(UserPhoneVerified.unverified().value).toBe(false);
  });
});
