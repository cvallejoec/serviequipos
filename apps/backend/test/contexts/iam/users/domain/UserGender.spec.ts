import {
  UserGender,
  UserGenderEnum,
} from '../../../../../src/contexts/iam/users/domain/value-objects/UserGender';
import { InvalidArgumentError } from '../../../../../src/common/domain/InvalidArgumentError';

describe('UserGender', () => {
  it.each(Object.values(UserGenderEnum))(
    'acepta el género válido "%s"',
    (valid) => {
      expect(new UserGender(valid).value).toBe(valid);
    },
  );

  it.each(['male', 'FEMENINO', 'X', ''])(
    'rechaza el género inválido "%s"',
    (invalid) => {
      expect(() => new UserGender(invalid as never)).toThrow(
        InvalidArgumentError,
      );
    },
  );
});
