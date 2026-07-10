import { HttpStatus } from '@nestjs/common';
import { UserNotFound } from '../../../../../../src/contexts/iam/users/domain/errors/UserNotFound';
import { DomainError } from '../../../../../../src/common/domain/DomainError';

describe('UserNotFound', () => {
  it('expone el type, el status HTTP y el mensaje esperados', () => {
    const error = new UserNotFound('user-123');

    expect(error).toBeInstanceOf(DomainError);
    expect(error.type).toBe('USER_NOT_FOUND');
    expect(error.suggestedHttpStatus).toBe(HttpStatus.NOT_FOUND);
    expect(error.message).toBe('Usuario con ID <user-123> no encontrado');
    expect(error.userId).toBe('user-123');
  });

  it('serializa el id del usuario en toPrimitives', () => {
    const primitives = new UserNotFound('user-123').toPrimitives();
    expect(primitives.type).toBe('USER_NOT_FOUND');
    expect(primitives.data).toEqual({ userId: 'user-123' });
  });
});
