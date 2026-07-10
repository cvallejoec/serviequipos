import { CompleteProfileCommandHandler } from '../../../../../src/contexts/iam/users/application/profile-completer/CompleteProfileCommandHandler';
import { CompleteProfileCommand } from '../../../../../src/contexts/iam/users/application/profile-completer/CompleteProfileCommand';
import { UserNotFound } from '../../../../../src/contexts/iam/users/domain/errors/UserNotFound';
import { InvalidArgumentError } from '../../../../../src/common/domain/InvalidArgumentError';
import { createMockUserRepository } from '../../../../mocks/UserRepositoryMock';
import { UserBuilder } from '../../../../builders/UserBuilder';
import { Cuid } from '../../../../../src/common/domain/Cuid';
import { FixedClock } from '../../../../mocks/ClockMock';

describe('CompleteProfileCommandHandler', () => {
  const repository = createMockUserRepository();
  const handler = new CompleteProfileCommandHandler(
    repository,
    new FixedClock(),
  );

  beforeEach(() => jest.clearAllMocks());

  const command = (userId: string) =>
    new CompleteProfileCommand(userId, 'Grace', 'Hopper', '+593987654321');

  it('completa el perfil y persiste el usuario', async () => {
    const user = UserBuilder.aUser().withProfileCompleted(false).build();
    repository.findById.mockResolvedValue(user);
    repository.save.mockResolvedValue(undefined);

    const result = await handler.execute(command(user.toPrimitives().id));

    expect(repository.save).toHaveBeenCalledTimes(1);
    const saved = repository.save.mock.calls[0][0];
    expect(saved.toPrimitives().profileCompleted).toBe(true);
    expect(saved.toPrimitives().firstName).toBe('Grace');
    expect(result).toBe(user);
  });

  it('lanza UserNotFound y no persiste si el usuario no existe', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(handler.execute(command(Cuid.random().value))).rejects.toThrow(
      UserNotFound,
    );
    expect(repository.save).not.toHaveBeenCalled();
  });

  it('propaga el error de dominio si el teléfono es inválido', async () => {
    const user = UserBuilder.aUser().build();
    repository.findById.mockResolvedValue(user);

    await expect(
      handler.execute(
        new CompleteProfileCommand(
          user.toPrimitives().id,
          'Grace',
          'Hopper',
          'telefono-malo',
        ),
      ),
    ).rejects.toThrow(InvalidArgumentError);
    expect(repository.save).not.toHaveBeenCalled();
  });
});
