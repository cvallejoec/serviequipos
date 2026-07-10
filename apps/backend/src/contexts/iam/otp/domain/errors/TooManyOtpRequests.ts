import { DomainError } from '../../../../../common/domain';
import { HttpStatus } from '@nestjs/common';

export class TooManyOtpRequests extends DomainError {
  readonly type = 'TOO_MANY_OTP_REQUESTS';

  constructor() {
    super(
      'Demasiados intentos. Espera unos minutos antes de solicitar un nuevo código',
      HttpStatus.TOO_MANY_REQUESTS,
    );
  }
}
