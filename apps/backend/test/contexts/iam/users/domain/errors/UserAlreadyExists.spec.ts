import { HttpStatus } from '@nestjs/common';
import { UserAlreadyExists } from '../../../../../../src/contexts/iam/users/domain/errors/UserAlreadyExists';
import { DomainError } from '../../../../../../src/common/domain/DomainError';

describe('UserAlreadyExists', () => {
  it('expone el type, el status HTTP y el mensaje esperados', () => {
    const error = new UserAlreadyExists('correo', 'ada@example.com');

    expect(error).toBeInstanceOf(DomainError);
    expect(error.type).toBe('USER_ALREADY_EXISTS');
    expect(error.suggestedHttpStatus).toBe(HttpStatus.CONFLICT);
    expect(error.message).toBe(
      'Usuario con correo <ada@example.com> ya existe',
    );
    expect(error.field).toBe('correo');
    expect(error.value).toBe('ada@example.com');
  });

  it('serializa el campo y el valor en toPrimitives', () => {
    const primitives = new UserAlreadyExists(
      'correo',
      'ada@example.com',
    ).toPrimitives();
    expect(primitives.type).toBe('USER_ALREADY_EXISTS');
    expect(primitives.data).toEqual({
      field: 'correo',
      value: 'ada@example.com',
    });
  });
});
