import { UserProfileCompleted } from '../../../../../src/contexts/iam/users/domain/value-objects/UserProfileCompleted';

describe('UserProfileCompleted', () => {
  it('acepta el valor booleano recibido', () => {
    expect(new UserProfileCompleted(true).value).toBe(true);
    expect(new UserProfileCompleted(false).value).toBe(false);
  });

  it('completed() representa un perfil completo', () => {
    expect(UserProfileCompleted.completed().value).toBe(true);
  });

  it('incomplete() representa un perfil incompleto', () => {
    expect(UserProfileCompleted.incomplete().value).toBe(false);
  });
});
