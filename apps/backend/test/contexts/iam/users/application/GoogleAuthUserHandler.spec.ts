import { GoogleAuthUserHandler } from '../../../../../src/contexts/iam/users/application/google-auth-user/GoogleAuthUserHandler';
import { GoogleAuthUserCommand } from '../../../../../src/contexts/iam/users/application/google-auth-user/GoogleAuthUserCommand';
import { UserAvatar } from '../../../../../src/contexts/iam/users/domain/value-objects/UserAvatar';
import { InvalidArgumentError } from '../../../../../src/common/domain/InvalidArgumentError';
import { createMockUserRepository } from '../../../../mocks/UserRepositoryMock';
import { UserBuilder } from '../../../../builders/UserBuilder';
import { Cuid } from '../../../../../src/common/domain/Cuid';
import { FixedClock } from '../../../../mocks/ClockMock';

describe('GoogleAuthUserHandler', () => {
  const repository = createMockUserRepository();
  const handler = new GoogleAuthUserHandler(repository, new FixedClock());

  beforeEach(() => jest.clearAllMocks());

  const command = (overrides: Partial<GoogleAuthUserCommand> = {}) =>
    new GoogleAuthUserCommand(
      overrides.id ?? Cuid.random().value,
      overrides.firstName ?? 'Ada',
      overrides.lastName ?? 'Lovelace',
      overrides.email ?? 'ada@example.com',
      overrides.avatar ?? null,
    );

  describe('usuario nuevo', () => {
    it('crea el usuario con email verificado y lo persiste', async () => {
      repository.findByEmail.mockResolvedValue(null);
      repository.save.mockResolvedValue(undefined);

      const result = await handler.execute(command());

      expect(repository.save).toHaveBeenCalledTimes(1);
      const primitives = result.toPrimitives();
      expect(primitives.email).toBe('ada@example.com');
      expect(primitives.emailVerified).toBe(true);
    });

    it('usa el avatar del proveedor cuando llega uno', async () => {
      repository.findByEmail.mockResolvedValue(null);
      repository.save.mockResolvedValue(undefined);

      const result = await handler.execute(
        command({ avatar: 'https://lh3.google.com/foto.png' }),
      );

      expect(result.toPrimitives().avatar).toBe(
        'https://lh3.google.com/foto.png',
      );
    });

    it('genera un avatar por defecto cuando no llega avatar', async () => {
      repository.findByEmail.mockResolvedValue(null);
      repository.save.mockResolvedValue(undefined);

      const result = await handler.execute(command({ avatar: null }));

      expect(result.toPrimitives().avatar).toContain('ui-avatars.com');
    });

    it('propaga el error de dominio si el correo es inválido', async () => {
      repository.findByEmail.mockResolvedValue(null);

      await expect(
        handler.execute(command({ email: 'correo-malo' })),
      ).rejects.toThrow(InvalidArgumentError);
      expect(repository.save).not.toHaveBeenCalled();
    });
  });

  describe('usuario existente', () => {
    it('devuelve el usuario existente sin recrearlo', async () => {
      const existing = UserBuilder.aUser().withEmail('ada@example.com').build();
      repository.findByEmail.mockResolvedValue(existing);

      const result = await handler.execute(command({ avatar: null }));

      expect(result).toBe(existing);
      expect(repository.save).not.toHaveBeenCalled();
    });

    it('reemplaza el avatar autogenerado con la foto del proveedor', async () => {
      const existing = UserBuilder.aUser()
        .withEmail('ada@example.com')
        .withAvatar(UserAvatar.fromName('Ada', 'Lovelace').value)
        .build();
      repository.findByEmail.mockResolvedValue(existing);
      repository.save.mockResolvedValue(undefined);

      const result = await handler.execute(
        command({ avatar: 'https://lh3.google.com/foto.png' }),
      );

      expect(result.toPrimitives().avatar).toBe(
        'https://lh3.google.com/foto.png',
      );
      expect(repository.save).toHaveBeenCalledTimes(1);
    });

    it('respeta un avatar real existente y no lo pisa', async () => {
      const existing = UserBuilder.aUser()
        .withEmail('ada@example.com')
        .withAvatar('https://cdn.test/avatars/foto-subida.webp')
        .build();
      repository.findByEmail.mockResolvedValue(existing);

      const result = await handler.execute(
        command({ avatar: 'https://lh3.google.com/foto.png' }),
      );

      expect(result.toPrimitives().avatar).toBe(
        'https://cdn.test/avatars/foto-subida.webp',
      );
      expect(repository.save).not.toHaveBeenCalled();
    });

    it('no toca al usuario existente cuando no llega avatar', async () => {
      const existing = UserBuilder.aUser()
        .withEmail('ada@example.com')
        .withAvatar(UserAvatar.fromName('Ada', 'Lovelace').value)
        .build();
      repository.findByEmail.mockResolvedValue(existing);

      await handler.execute(command({ avatar: null }));

      expect(repository.save).not.toHaveBeenCalled();
    });
  });
});
