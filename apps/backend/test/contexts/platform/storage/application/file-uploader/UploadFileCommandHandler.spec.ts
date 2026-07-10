import { faker } from '@faker-js/faker/locale/en';
import { UploadFileCommandHandler } from '../../../../../../src/contexts/platform/storage/application/file-uploader/UploadFileCommandHandler';
import { UploadFileCommand } from '../../../../../../src/contexts/platform/storage/application/file-uploader/UploadFileCommand';
import { InvalidArgumentError } from '../../../../../../src/common/domain/InvalidArgumentError';
import { createMockFileStorage } from '../../../../../mocks/FileStorageMock';

describe('UploadFileCommandHandler', () => {
  const fileStorage = createMockFileStorage();
  const handler = new UploadFileCommandHandler(fileStorage);

  beforeEach(() => jest.clearAllMocks());

  const command = (
    overrides: Partial<{
      key: string;
      content: Buffer;
      contentType: string;
      visibility: 'public' | 'private';
      metadata: Record<string, string> | null;
    }> = {},
  ) =>
    new UploadFileCommand(
      overrides.key ?? 'users/123/avatar.png',
      overrides.content ?? Buffer.from('contenido'),
      overrides.contentType ?? 'image/png',
      overrides.visibility ?? 'public',
      overrides.metadata ?? null,
    );

  it('sube el archivo y devuelve el UploadedFile del puerto', async () => {
    const uploaded = {
      key: 'users/123/avatar.png',
      url: faker.internet.url(),
      size: 42,
      contentType: 'image/png',
    };
    fileStorage.upload.mockResolvedValue(uploaded);

    const result = await handler.execute(command());

    expect(result).toBe(uploaded);
    expect(fileStorage.upload).toHaveBeenCalledTimes(1);
  });

  it('mapea los primitivos del command a un FileToUpload con value object de visibilidad', async () => {
    const content = Buffer.from('bytes');
    await handler.execute(
      command({
        key: 'docs/report.pdf',
        content,
        contentType: 'application/pdf',
        visibility: 'private',
        metadata: { owner: 'grace' },
      }),
    );

    const arg = fileStorage.upload.mock.calls[0][0];
    expect(arg.key).toBe('docs/report.pdf');
    expect(arg.content).toBe(content);
    expect(arg.contentType).toBe('application/pdf');
    expect(arg.visibility.value).toBe('private');
    expect(arg.metadata).toEqual({ owner: 'grace' });
  });

  it('convierte metadata null en undefined al delegar', async () => {
    await handler.execute(command({ metadata: null }));

    const arg = fileStorage.upload.mock.calls[0][0];
    expect(arg.metadata).toBeUndefined();
  });

  it('lanza InvalidArgumentError y no sube si la visibilidad es inválida', async () => {
    const invalid = command({
      visibility: 'protected' as 'public' | 'private',
    });

    await expect(handler.execute(invalid)).rejects.toThrow(
      InvalidArgumentError,
    );
    expect(fileStorage.upload).not.toHaveBeenCalled();
  });

  it('propaga el error si el puerto de storage falla', async () => {
    const failure = new Error('spaces caído');
    fileStorage.upload.mockRejectedValue(failure);

    await expect(handler.execute(command())).rejects.toThrow(failure);
  });
});
