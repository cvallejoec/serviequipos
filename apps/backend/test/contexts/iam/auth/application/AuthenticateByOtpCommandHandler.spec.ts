import { AuthenticateByOtpCommandHandler } from '../../../../../src/contexts/iam/auth/application/otp-authenticator/AuthenticateByOtpCommandHandler';
import { AuthenticateByOtpCommand } from '../../../../../src/contexts/iam/auth/application/otp-authenticator/AuthenticateByOtpCommand';
import { VerifyOtpQueryHandler } from '../../../../../src/contexts/iam/otp/application/verifier/VerifyOtpQueryHandler';
import { InvalidOtpCode } from '../../../../../src/contexts/iam/otp/domain/errors/InvalidOtpCode';
import { createMockUserRepository } from '../../../../mocks/UserRepositoryMock';
import { createMockOtpCodeRepository } from '../../../../mocks/OtpCodeRepositoryMock';
import { UserBuilder } from '../../../../builders/UserBuilder';
import { OtpCodeBuilder } from '../../../../builders/OtpCodeBuilder';
import { FixedClock } from '../../../../mocks/ClockMock';

describe('AuthenticateByOtpCommandHandler', () => {
  const userRepository = createMockUserRepository();
  const otpRepository = createMockOtpCodeRepository();
  // Usamos el VerifyOtpQueryHandler real sobre un OtpCodeRepository mockeado:
  // así ejercitamos la colaboración real entre auth y otp.
  const verifyOtpHandler = new VerifyOtpQueryHandler(otpRepository);
  const handler = new AuthenticateByOtpCommandHandler(
    userRepository,
    verifyOtpHandler,
    new FixedClock(),
  );

  beforeEach(() => jest.clearAllMocks());

  const command = (email = 'ada@example.com', code = '123456') =>
    new AuthenticateByOtpCommand(email, code);

  const makeOtpValid = () => {
    const otp = OtpCodeBuilder.anOtpCode()
      .withEmail('ada@example.com')
      .withCode('123456')
      .build();
    otpRepository.findValidByEmailAndCode.mockResolvedValue(otp);
    otpRepository.markUsed.mockResolvedValue(undefined);
  };

  it('devuelve el usuario existente sin crear uno nuevo', async () => {
    makeOtpValid();
    const existing = UserBuilder.aUser().withEmail('ada@example.com').build();
    userRepository.findByEmail.mockResolvedValue(existing);

    const result = await handler.execute(command());

    expect(result).toBe(existing);
    expect(userRepository.save).not.toHaveBeenCalled();
    // El OTP se verificó y marcó usado.
    expect(otpRepository.markUsed).toHaveBeenCalledTimes(1);
  });

  it('crea y persiste un usuario nuevo verificado cuando el correo no existe', async () => {
    makeOtpValid();
    userRepository.findByEmail.mockResolvedValue(null);
    userRepository.save.mockResolvedValue(undefined);

    const result = await handler.execute(command());

    expect(userRepository.save).toHaveBeenCalledTimes(1);
    const saved = userRepository.save.mock.calls[0][0];
    expect(saved).toBe(result);

    const primitives = result.toPrimitives();
    expect(primitives.email).toBe('ada@example.com');
    expect(primitives.emailVerified).toBe(true);
    expect(primitives.firstName).toBe('Usuario');
    expect(primitives.lastName).toBe('Nuevo');
  });

  it('lanza InvalidOtpCode y no toca usuarios si el OTP es inválido', async () => {
    otpRepository.findValidByEmailAndCode.mockResolvedValue(null);

    await expect(handler.execute(command())).rejects.toThrow(InvalidOtpCode);
    expect(userRepository.findByEmail).not.toHaveBeenCalled();
    expect(userRepository.save).not.toHaveBeenCalled();
  });
});
