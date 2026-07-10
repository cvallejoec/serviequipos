import { HttpStatus } from '@nestjs/common';
import { DomainError } from '../../../../../common/domain';

export class UserAlreadyExists extends DomainError {
  readonly type = 'USER_ALREADY_EXISTS';

  constructor(
    public readonly field: 'correo',
    public readonly value: string,
  ) {
    super(`Usuario con ${field} <${value}> ya existe`, HttpStatus.CONFLICT);
  }
}
