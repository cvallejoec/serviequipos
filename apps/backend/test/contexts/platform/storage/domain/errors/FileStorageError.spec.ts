import { HttpStatus } from '@nestjs/common';
import { FileStorageError } from '../../../../../../src/contexts/platform/storage/domain/errors/FileStorageError';
import { DomainError } from '../../../../../../src/common/domain/DomainError';

describe('FileStorageError', () => {
  const error = new FileStorageError('DigitalOceanSpaces', 'algo falló');

  it('es un DomainError', () => {
    expect(error).toBeInstanceOf(DomainError);
  });

  it('tiene el type FILE_STORAGE_ERROR', () => {
    expect(error.type).toBe('FILE_STORAGE_ERROR');
  });

  it('sugiere HTTP 500 (INTERNAL_SERVER_ERROR)', () => {
    expect(error.suggestedHttpStatus).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
  });

  it('prefija el mensaje con el provider', () => {
    expect(error.message).toBe('[DigitalOceanSpaces] algo falló');
  });

  it('guarda el provider que falló', () => {
    expect(error.provider).toBe('DigitalOceanSpaces');
  });

  it('serializa a primitivos con type, description y data', () => {
    const primitives = error.toPrimitives();

    expect(primitives.type).toBe('FILE_STORAGE_ERROR');
    expect(primitives.description).toBe('[DigitalOceanSpaces] algo falló');
    // `toPrimitives` incluye las propiedades propias (provider) en `data`.
    expect(primitives.data).toEqual({ provider: 'DigitalOceanSpaces' });
  });
});
