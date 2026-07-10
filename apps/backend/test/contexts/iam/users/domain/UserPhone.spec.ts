import { UserPhone } from '../../../../../src/contexts/iam/users/domain/value-objects/UserPhone';
import { InvalidArgumentError } from '../../../../../src/common/domain/InvalidArgumentError';

describe('UserPhone', () => {
  it.each(['+593987654321', '+12025550123', '+441234567890'])(
    'acepta el teléfono E.164 válido "%s"',
    (valid) => {
      expect(new UserPhone(valid).value).toBe(valid);
    },
  );

  it.each([
    '0987654321', // sin prefijo +
    '+0987654321', // empieza en 0 tras el +
    '+59398', // demasiado corto
    '+5939876543210123', // demasiado largo
    '593 987 654 321', // con espacios
    '',
  ])('rechaza el teléfono inválido "%s"', (invalid) => {
    expect(() => new UserPhone(invalid)).toThrow(InvalidArgumentError);
  });
});
