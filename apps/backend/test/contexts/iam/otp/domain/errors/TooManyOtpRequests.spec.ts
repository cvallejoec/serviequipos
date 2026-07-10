import { HttpStatus } from '@nestjs/common';
import { TooManyOtpRequests } from '../../../../../../src/contexts/iam/otp/domain/errors/TooManyOtpRequests';
import { DomainError } from '../../../../../../src/common/domain/DomainError';

describe('TooManyOtpRequests', () => {
  it('es un DomainError con tipo, mensaje y status correctos', () => {
    const error = new TooManyOtpRequests();

    expect(error).toBeInstanceOf(DomainError);
    expect(error.type).toBe('TOO_MANY_OTP_REQUESTS');
    expect(error.message).toBe(
      'Demasiados intentos. Espera unos minutos antes de solicitar un nuevo código',
    );
    expect(error.suggestedHttpStatus).toBe(HttpStatus.TOO_MANY_REQUESTS);
  });
});
