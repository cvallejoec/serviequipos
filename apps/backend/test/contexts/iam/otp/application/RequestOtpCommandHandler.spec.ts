import type { ConfigService } from '@nestjs/config';
import { RequestOtpCommandHandler } from '../../../../../src/contexts/iam/otp/application/request/RequestOtpCommandHandler';
import { RequestOtpCommand } from '../../../../../src/contexts/iam/otp/application/request/RequestOtpCommand';
import { TooManyOtpRequests } from '../../../../../src/contexts/iam/otp/domain/errors/TooManyOtpRequests';
import { OtpCode } from '../../../../../src/contexts/iam/otp/domain/OtpCode';
import { createMockOtpCodeRepository } from '../../../../mocks/OtpCodeRepositoryMock';
import { createMockEmailSender } from '../../../../mocks/EmailSenderMock';
import { createMockConfigService } from '../../../../mocks/ConfigServiceMock';
import { FixedClock, FIXED_NOW } from '../../../../mocks/ClockMock';

describe('RequestOtpCommandHandler', () => {
  const repository = createMockOtpCodeRepository();
  const emailSender = createMockEmailSender();
  const configService = createMockConfigService({
    FRONTEND_URL: 'https://app.test',
  });
  const handler = new RequestOtpCommandHandler(
    repository,
    emailSender,
    configService as unknown as ConfigService,
    new FixedClock(),
  );

  beforeEach(() => jest.clearAllMocks());

  const command = (email = 'ada@example.com') =>
    new RequestOtpCommand('ignored-id', email);

  it('genera, persiste y envía un OTP en el camino feliz', async () => {
    repository.countRecentByEmail.mockResolvedValue(0);
    repository.save.mockResolvedValue(undefined);
    emailSender.send.mockResolvedValue(undefined);

    await handler.execute(command());

    expect(repository.save).toHaveBeenCalledTimes(1);
    const savedOtp = repository.save.mock.calls[0][0] as OtpCode;
    const primitives = savedOtp.toPrimitives();
    expect(primitives.email).toBe('ada@example.com');
    // Código de 6 dígitos generado por el handler.
    expect(primitives.code).toMatch(/^\d{6}$/);
    expect(primitives.usedAt.isEmpty()).toBe(true);

    expect(emailSender.send).toHaveBeenCalledTimes(1);
    const sent = emailSender.send.mock.calls[0][0];
    expect(sent.to).toBe('ada@example.com');
    expect(sent.subject).toBe('Tu código de verificación');
    // El correo incluye el mismo código que se persistió.
    expect(sent.htmlBody).toContain(primitives.code);
  });

  it('incluye el magic link con la FRONTEND_URL en el correo', async () => {
    repository.countRecentByEmail.mockResolvedValue(0);

    await handler.execute(command('grace@example.com'));

    const sent = emailSender.send.mock.calls[0][0];
    expect(sent.htmlBody).toContain('https://app.test/login/magic');
    expect(sent.htmlBody).toContain('grace%40example.com');
    expect(configService.getOrThrow).toHaveBeenCalledWith('FRONTEND_URL');
  });

  it('consulta los OTP recientes de la última hora', async () => {
    repository.countRecentByEmail.mockResolvedValue(0);

    await handler.execute(command());

    expect(repository.countRecentByEmail).toHaveBeenCalledTimes(1);
    const [emailArg, sinceArg] = repository.countRecentByEmail.mock.calls[0];
    expect(emailArg.value).toBe('ada@example.com');
    // `since` es exactamente una hora antes del `now()` fijo del reloj.
    const expectedSince = new Date(FIXED_NOW.getTime() - 60 * 60 * 1000);
    expect(sinceArg.getTime()).toBe(expectedSince.getTime());
  });

  it('lanza TooManyOtpRequests y no persiste ni envía si se supera el tope horario', async () => {
    // MAX_OTPS_PER_HOUR es 10; 10 recientes ya alcanza el tope.
    repository.countRecentByEmail.mockResolvedValue(10);

    await expect(handler.execute(command())).rejects.toThrow(
      TooManyOtpRequests,
    );
    expect(repository.save).not.toHaveBeenCalled();
    expect(emailSender.send).not.toHaveBeenCalled();
  });

  it('permite la solicitud justo por debajo del tope', async () => {
    repository.countRecentByEmail.mockResolvedValue(9);

    await expect(handler.execute(command())).resolves.toBeUndefined();
    expect(repository.save).toHaveBeenCalledTimes(1);
    expect(emailSender.send).toHaveBeenCalledTimes(1);
  });
});
