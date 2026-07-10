import { HttpStatus } from '@nestjs/common';
import { DomainError } from '../../../../../common/domain';

export class UserNotFound extends DomainError {
  readonly type = 'USER_NOT_FOUND';

  constructor(public readonly userId: string) {
    super(`Usuario con ID <${userId}> no encontrado`, HttpStatus.NOT_FOUND);
  }
}
