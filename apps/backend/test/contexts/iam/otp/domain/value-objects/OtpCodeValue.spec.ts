import { OtpCodeValue } from '../../../../../../src/contexts/iam/otp/domain/value-objects/OtpCodeValue';
import { InvalidArgumentError } from '../../../../../../src/common/domain/InvalidArgumentError';

describe('OtpCodeValue', () => {
  it('acepta un código de 6 dígitos y expone su valor', () => {
    const code = new OtpCodeValue('123456');
    expect(code.value).toBe('123456');
  });

  // OtpCodeValue es un StringValueObject sin validación de formato: solo
  // rechaza null/undefined (regla común de ValueObject).
  it('lanza InvalidArgumentError si el valor es null', () => {
    expect(() => new OtpCodeValue(null as unknown as string)).toThrow(
      InvalidArgumentError,
    );
  });

  it('lanza InvalidArgumentError si el valor es undefined', () => {
    expect(() => new OtpCodeValue(undefined as unknown as string)).toThrow(
      InvalidArgumentError,
    );
  });
});
