import sharp from 'sharp';
import { ChangeUserAvatarCommandHandler } from '../../../../../src/contexts/iam/users/application/avatar-changer/ChangeUserAvatarCommandHandler';
import { ChangeUserAvatarCommand } from '../../../../../src/contexts/iam/users/application/avatar-changer/ChangeUserAvatarCommand';
import { UserNotFound } from '../../../../../src/contexts/iam/users/domain/errors/UserNotFound';
import { UserAvatarInvalid } from '../../../../../src/contexts/iam/users/domain/errors/UserAvatarInvalid';
import { createMockUserRepository } from '../../../../mocks/UserRepositoryMock';
import { createMockFileStorage } from '../../../../mocks/FileStorageMock';
import { UserBuilder } from '../../../../builders/UserBuilder';
import { Cuid } from '../../../../../src/common/domain/Cuid';
import { FixedClock } from '../../../../mocks/ClockMock';

describe('ChangeUserAvatarCommandHandler', () => {
  const repository = createMockUserRepository();
  const fileStorage = createMockFileStorage();
  const handler = new ChangeUserAvatarCommandHandler(
    repository,
    fileStorage,
    new FixedClock(),
  );

  // Imagen PNG válida generada con sharp: el handler la procesa de verdad.
  let validPng: Buffer;

  beforeAll(async () => {
    validPng = await sharp({
      create: {
        width: 300,
        height: 300,
        channels: 3,
        background: { r: 120, g: 80, b: 200 },
      },
    })
      .png()
      .toBuffer();
  });

  beforeEach(() => jest.clearAllMocks());

  it('procesa la imagen, la sube y guarda el avatar en el usuario', async () => {
    const user = UserBuilder.aUser()
      .withAvatar('https://cdn.test/avatars/anterior.webp')
      .build();
    repository.findById.mockResolvedValue(user);
    repository.save.mockResolvedValue(undefined);
    fileStorage.upload.mockResolvedValue({
      key: 'avatars/nuevo.webp',
      url: 'https://cdn.test/avatars/nuevo.webp',
      size: 1234,
      contentType: 'image/webp',
    });

    const result = await handler.execute(
      new ChangeUserAvatarCommand(
        user.toPrimitives().id,
        validPng,
        'image/png',
      ),
    );

    expect(fileStorage.upload).toHaveBeenCalledTimes(1);
    const uploadArg = fileStorage.upload.mock.calls[0][0];
    expect(uploadArg.contentType).toBe('image/webp');
    expect(uploadArg.key).toMatch(/^avatars\/.+\.webp$/);
    expect(repository.save).toHaveBeenCalledTimes(1);
    expect(result.toPrimitives().avatar).toBe(
      'https://cdn.test/avatars/nuevo.webp',
    );
  });

  it('borra el avatar anterior si estaba en nuestro bucket', async () => {
    const user = UserBuilder.aUser()
      .withAvatar('https://cdn.test/avatars/anterior.webp')
      .build();
    repository.findById.mockResolvedValue(user);
    repository.save.mockResolvedValue(undefined);
    fileStorage.upload.mockResolvedValue({
      key: 'avatars/nuevo.webp',
      url: 'https://cdn.test/avatars/nuevo.webp',
      size: 1234,
      contentType: 'image/webp',
    });

    await handler.execute(
      new ChangeUserAvatarCommand(
        user.toPrimitives().id,
        validPng,
        'image/png',
      ),
    );

    expect(fileStorage.delete).toHaveBeenCalledWith('avatars/anterior.webp');
  });

  it('no borra el avatar anterior si es una URL ajena (ui-avatars)', async () => {
    const user = UserBuilder.aUser()
      .withAvatar('https://ui-avatars.com/api/?name=Ada%20Lovelace')
      .build();
    repository.findById.mockResolvedValue(user);
    repository.save.mockResolvedValue(undefined);
    fileStorage.upload.mockResolvedValue({
      key: 'avatars/nuevo.webp',
      url: 'https://cdn.test/avatars/nuevo.webp',
      size: 1234,
      contentType: 'image/webp',
    });

    await handler.execute(
      new ChangeUserAvatarCommand(
        user.toPrimitives().id,
        validPng,
        'image/png',
      ),
    );

    expect(fileStorage.delete).not.toHaveBeenCalled();
  });

  it('rechaza un mime type no soportado antes de tocar el repositorio', async () => {
    await expect(
      handler.execute(
        new ChangeUserAvatarCommand(
          Cuid.random().value,
          validPng,
          'application/pdf',
        ),
      ),
    ).rejects.toThrow(UserAvatarInvalid);
    expect(repository.findById).not.toHaveBeenCalled();
  });

  it('rechaza una imagen que supera el tamaño máximo', async () => {
    const tooBig = Buffer.alloc(5 * 1024 * 1024 + 1);

    await expect(
      handler.execute(
        new ChangeUserAvatarCommand(Cuid.random().value, tooBig, 'image/png'),
      ),
    ).rejects.toThrow(UserAvatarInvalid);
    expect(repository.findById).not.toHaveBeenCalled();
  });

  it('rechaza un archivo vacío', async () => {
    await expect(
      handler.execute(
        new ChangeUserAvatarCommand(
          Cuid.random().value,
          Buffer.alloc(0),
          'image/png',
        ),
      ),
    ).rejects.toThrow(UserAvatarInvalid);
    expect(repository.findById).not.toHaveBeenCalled();
  });

  it('lanza UserNotFound cuando el usuario no existe', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(
      handler.execute(
        new ChangeUserAvatarCommand(Cuid.random().value, validPng, 'image/png'),
      ),
    ).rejects.toThrow(UserNotFound);
    expect(fileStorage.upload).not.toHaveBeenCalled();
  });

  it('lanza UserAvatarInvalid cuando el contenido no es una imagen procesable', async () => {
    const user = UserBuilder.aUser().build();
    repository.findById.mockResolvedValue(user);
    const corrupt = Buffer.from('esto-no-es-una-imagen');

    await expect(
      handler.execute(
        new ChangeUserAvatarCommand(
          user.toPrimitives().id,
          corrupt,
          'image/png',
        ),
      ),
    ).rejects.toThrow(UserAvatarInvalid);
    expect(fileStorage.upload).not.toHaveBeenCalled();
    expect(repository.save).not.toHaveBeenCalled();
  });

  it('no falla la operación si el borrado del avatar anterior lanza', async () => {
    const user = UserBuilder.aUser()
      .withAvatar('https://cdn.test/avatars/anterior.webp')
      .build();
    repository.findById.mockResolvedValue(user);
    repository.save.mockResolvedValue(undefined);
    fileStorage.upload.mockResolvedValue({
      key: 'avatars/nuevo.webp',
      url: 'https://cdn.test/avatars/nuevo.webp',
      size: 1234,
      contentType: 'image/webp',
    });
    fileStorage.delete.mockRejectedValue(new Error('storage caído'));

    const result = await handler.execute(
      new ChangeUserAvatarCommand(
        user.toPrimitives().id,
        validPng,
        'image/png',
      ),
    );

    expect(result.toPrimitives().avatar).toBe(
      'https://cdn.test/avatars/nuevo.webp',
    );
  });
});
