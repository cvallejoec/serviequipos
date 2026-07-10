import { OtpCodeEmail } from '../../../../../../src/contexts/iam/otp/domain/value-objects/OtpCodeEmail';
import { InvalidArgumentError } from '../../../../../../src/common/domain/InvalidArgumentError';

describe('OtpCodeEmail', () => {
  it('acepta un correo y expone su valor', () => {
    const email = new OtpCodeEmail('ada@example.com');
    expect(email.value).toBe('ada@example.com');
  });

  // OtpCodeEmail es un StringValueObject sin validación de formato: solo
  // rechaza null/undefined (regla común de ValueObject).
  it('lanza InvalidArgumentError si el valor es null', () => {
    expect(() => new OtpCodeEmail(null as unknown as string)).toThrow(
      InvalidArgumentError,
    );
  });

  it('lanza InvalidArgumentError si el valor es undefined', () => {
    expect(() => new OtpCodeEmail(undefined as unknown as string)).toThrow(
      InvalidArgumentError,
    );
  });
});
