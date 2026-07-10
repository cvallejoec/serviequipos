import { HttpStatus } from '@nestjs/common';
import { UserAvatarInvalid } from '../../../../../../src/contexts/iam/users/domain/errors/UserAvatarInvalid';
import { DomainError } from '../../../../../../src/common/domain/DomainError';

describe('UserAvatarInvalid', () => {
  it('expone el type, el status HTTP y el mensaje recibido', () => {
    const error = new UserAvatarInvalid('Formato de imagen no soportado.');

    expect(error).toBeInstanceOf(DomainError);
    expect(error.type).toBe('USER_AVATAR_INVALID');
    expect(error.suggestedHttpStatus).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
    expect(error.message).toBe('Formato de imagen no soportado.');
  });
});
