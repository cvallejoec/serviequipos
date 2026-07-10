import { HttpStatus } from '@nestjs/common';
import { DomainError } from '../../../../../common/domain';

/**
 * La imagen que el usuario intentó subir como avatar no cumple los
 * requisitos (formato no soportado, demasiado pesada o ilegible).
 * Se mapea a `422 Unprocessable Entity` para que el frontend muestre
 * el mensaje directamente al usuario.
 */
export class UserAvatarInvalid extends DomainError {
  readonly type = 'USER_AVATAR_INVALID';

  constructor(message: string) {
    super(message, HttpStatus.UNPROCESSABLE_ENTITY);
  }
}
