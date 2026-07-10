import { DomainError } from '../../../../../common/domain';
import { HttpStatus } from '@nestjs/common';

export class InvalidOtpCode extends DomainError {
  readonly type = 'INVALID_OTP_CODE';

  constructor() {
    super('Código OTP inválido o expirado', HttpStatus.BAD_REQUEST);
  }
}
