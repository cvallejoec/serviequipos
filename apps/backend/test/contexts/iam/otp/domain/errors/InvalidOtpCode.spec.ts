import { HttpStatus } from '@nestjs/common';
import { InvalidOtpCode } from '../../../../../../src/contexts/iam/otp/domain/errors/InvalidOtpCode';
import { DomainError } from '../../../../../../src/common/domain/DomainError';

describe('InvalidOtpCode', () => {
  it('es un DomainError con tipo, mensaje y status correctos', () => {
    const error = new InvalidOtpCode();

    expect(error).toBeInstanceOf(DomainError);
    expect(error.type).toBe('INVALID_OTP_CODE');
    expect(error.message).toBe('Código OTP inválido o expirado');
    expect(error.suggestedHttpStatus).toBe(HttpStatus.BAD_REQUEST);
  });
});
