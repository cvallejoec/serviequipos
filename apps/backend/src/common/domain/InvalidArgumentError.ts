import { HttpStatus } from '@nestjs/common';
import { DomainError } from './DomainError';

export class InvalidArgumentError extends DomainError {
  readonly type = 'INVALID_ARGUMENT';

  constructor(message: string) {
    super(message, HttpStatus.BAD_REQUEST);
  }
}
