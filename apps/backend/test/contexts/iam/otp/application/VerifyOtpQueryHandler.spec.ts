import { VerifyOtpQueryHandler } from '../../../../../src/contexts/iam/otp/application/verifier/VerifyOtpQueryHandler';
import { VerifyOtpQuery } from '../../../../../src/contexts/iam/otp/application/verifier/VerifyOtpQuery';
import { InvalidOtpCode } from '../../../../../src/contexts/iam/otp/domain/errors/InvalidOtpCode';
import { createMockOtpCodeRepository } from '../../../../mocks/OtpCodeRepositoryMock';
import { OtpCodeBuilder } from '../../../../builders/OtpCodeBuilder';

describe('VerifyOtpQueryHandler', () => {
  const repository = createMockOtpCodeRepository();
  const handler = new VerifyOtpQueryHandler(repository);

  beforeEach(() => jest.clearAllMocks());

  const query = (email = 'ada@example.com', code = '123456') =>
    new VerifyOtpQuery(email, code);

  it('marca el OTP como usado cuando el repositorio devuelve uno válido', async () => {
    const otp = OtpCodeBuilder.anOtpCode()
      .withEmail('ada@example.com')
      .withCode('123456')
      .build();
    repository.findValidByEmailAndCode.mockResolvedValue(otp);
    repository.markUsed.mockResolvedValue(undefined);

    await handler.execute(query());

    // Consulta con los value objects derivados del query.
    const [emailArg, codeArg] =
      repository.findValidByEmailAndCode.mock.calls[0];
    expect(emailArg.value).toBe('ada@example.com');
    expect(codeArg.value).toBe('123456');

    // Marca usado el OTP encontrado por su id.
    expect(repository.markUsed).toHaveBeenCalledTimes(1);
    const idArg = repository.markUsed.mock.calls[0][0];
    expect(idArg.value).toBe(otp.toPrimitives().id);
  });

  it('lanza InvalidOtpCode y no marca usado si no hay OTP válido', async () => {
    // El repositorio filtra código inexistente/incorrecto/expirado/usado:
    // devuelve null en todos esos casos.
    repository.findValidByEmailAndCode.mockResolvedValue(null);

    await expect(handler.execute(query())).rejects.toThrow(InvalidOtpCode);
    expect(repository.markUsed).not.toHaveBeenCalled();
  });
});
