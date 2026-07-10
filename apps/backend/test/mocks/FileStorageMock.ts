import type { FileStorage } from '../../src/contexts/platform/storage/domain/FileStorage';

/**
 * Doble de test del puerto `FileStorage`. No toca Digital Ocean Spaces.
 * Por defecto `upload` resuelve un `UploadedFile` plausible; sobreescríbelo
 * en el test con `mockResolvedValue(...)` cuando importe el resultado.
 */
export function createMockFileStorage(): jest.Mocked<FileStorage> {
  return {
    upload: jest.fn().mockResolvedValue({
      key: 'test/key',
      url: 'https://cdn.test/test/key',
      size: 0,
      contentType: 'application/octet-stream',
    }),
    delete: jest.fn().mockResolvedValue(undefined),
    getSignedUrl: jest.fn().mockResolvedValue('https://cdn.test/signed'),
  };
}
