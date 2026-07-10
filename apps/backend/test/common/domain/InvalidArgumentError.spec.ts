import { HttpStatus } from '@nestjs/common';
import { InvalidArgumentError } from '../../../src/common/domain/InvalidArgumentError';
import { DomainError } from '../../../src/common/domain/DomainError';

describe('InvalidArgumentError', () => {
  it('es un DomainError y un Error', () => {
    const error = new InvalidArgumentError('mensaje');
    expect(error).toBeInstanceOf(DomainError);
    expect(error).toBeInstanceOf(Error);
  });

  it('expone el tipo INVALID_ARGUMENT', () => {
    expect(new InvalidArgumentError('x').type).toBe('INVALID_ARGUMENT');
  });

  it('sugiere el estado HTTP 400 BAD_REQUEST', () => {
    expect(new InvalidArgumentError('x').suggestedHttpStatus).toBe(
      HttpStatus.BAD_REQUEST,
    );
  });

  it('conserva el mensaje recibido', () => {
    expect(new InvalidArgumentError('argumento inválido').message).toBe(
      'argumento inválido',
    );
  });

  it('toPrimitives refleja el tipo y la descripción', () => {
    const primitives = new InvalidArgumentError('detalle').toPrimitives();
    expect(primitives.type).toBe('INVALID_ARGUMENT');
    expect(primitives.description).toBe('detalle');
  });
});
