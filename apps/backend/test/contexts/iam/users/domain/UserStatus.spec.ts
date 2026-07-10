import {
  UserStatus,
  UserStatusEnum,
} from '../../../../../src/contexts/iam/users/domain/value-objects/UserStatus';
import { InvalidArgumentError } from '../../../../../src/common/domain/InvalidArgumentError';

describe('UserStatus', () => {
  it.each(Object.values(UserStatusEnum))(
    'acepta el estado válido "%s"',
    (valid) => {
      expect(new UserStatus(valid).value).toBe(valid);
    },
  );

  it.each(['activo', 'ENABLED', ''])(
    'rechaza el estado inválido "%s"',
    (invalid) => {
      expect(() => new UserStatus(invalid as never)).toThrow(
        InvalidArgumentError,
      );
    },
  );

  it('active() crea un estado ACTIVE', () => {
    const status = UserStatus.active();
    expect(status.value).toBe(UserStatusEnum.ACTIVE);
    expect(status.isActive()).toBe(true);
  });

  it('inactive() crea un estado INACTIVE', () => {
    const status = UserStatus.inactive();
    expect(status.value).toBe(UserStatusEnum.INACTIVE);
    expect(status.isActive()).toBe(false);
  });
});
