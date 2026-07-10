import { HttpStatus } from '@nestjs/common';
import { DomainError } from '../../../src/common/domain/DomainError';

// Subclase de prueba con datos adicionales para ejercitar toPrimitives().
class RecursoNoEncontradoError extends DomainError {
  readonly type = 'RECURSO_NO_ENCONTRADO';

  constructor(
    message: string,
    public readonly recursoId: string,
    suggestedHttpStatus: HttpStatus = HttpStatus.NOT_FOUND,
  ) {
    super(message, suggestedHttpStatus);
  }
}

describe('DomainError', () => {
  it('es un Error nativo', () => {
    expect(new RecursoNoEncontradoError('no está', 'abc')).toBeInstanceOf(
      Error,
    );
  });

  it('conserva el mensaje', () => {
    expect(new RecursoNoEncontradoError('no está', 'abc').message).toBe(
      'no está',
    );
  });

  it('expone el type de la subclase', () => {
    expect(new RecursoNoEncontradoError('x', 'abc').type).toBe(
      'RECURSO_NO_ENCONTRADO',
    );
  });

  describe('suggestedHttpStatus', () => {
    it('usa el estado provisto por la subclase', () => {
      expect(new RecursoNoEncontradoError('x', 'abc').suggestedHttpStatus).toBe(
        HttpStatus.NOT_FOUND,
      );
    });

    it('por defecto usa 422 UNPROCESSABLE_ENTITY', () => {
      const error = new RecursoNoEncontradoError(
        'x',
        'abc',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
      expect(error.suggestedHttpStatus).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
    });
  });

  describe('toPrimitives', () => {
    it('devuelve type y description', () => {
      const primitives = new RecursoNoEncontradoError(
        'no está',
        'abc',
      ).toPrimitives();
      expect(primitives.type).toBe('RECURSO_NO_ENCONTRADO');
      expect(primitives.description).toBe('no está');
    });

    it('incluye en data las propiedades propias (no type/message/status/stack)', () => {
      const primitives = new RecursoNoEncontradoError(
        'no está',
        'abc-123',
      ).toPrimitives();
      expect(primitives.data).toEqual({ recursoId: 'abc-123' });
    });

    it('data no expone las claves reservadas', () => {
      const { data } = new RecursoNoEncontradoError('x', 'abc').toPrimitives();
      expect(data).not.toHaveProperty('type');
      expect(data).not.toHaveProperty('message');
      expect(data).not.toHaveProperty('suggestedHttpStatus');
      expect(data).not.toHaveProperty('stack');
    });
  });
});
