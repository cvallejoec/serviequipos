import { NotFoundException } from '@nestjs/common';
import { UpdateUserProfileCommandHandler } from '../../../../../src/contexts/iam/users/application/updater/UpdateUserProfileCommandHandler';
import { UpdateUserProfileCommand } from '../../../../../src/contexts/iam/users/application/updater/UpdateUserProfileCommand';
import { createMockUserRepository } from '../../../../mocks/UserRepositoryMock';
import { UserBuilder } from '../../../../builders/UserBuilder';
import { Cuid } from '../../../../../src/common/domain/Cuid';
import { FixedClock } from '../../../../mocks/ClockMock';

describe('UpdateUserProfileCommandHandler', () => {
  const repository = createMockUserRepository();
  const handler = new UpdateUserProfileCommandHandler(
    repository,
    new FixedClock(),
  );

  beforeEach(() => jest.clearAllMocks());

  const command = (userId: string) =>
    new UpdateUserProfileCommand(
      userId,
      'Grace',
      'Hopper',
      '+593987654321',
      'FEMALE',
      '1990-05-20',
    );

  it('actualiza el perfil con género y fecha de nacimiento y persiste', async () => {
    const user = UserBuilder.aUser().build();
    repository.findById.mockResolvedValue(user);
    repository.save.mockResolvedValue(undefined);

    const result = await handler.execute(command(user.toPrimitives().id));

    expect(repository.save).toHaveBeenCalledTimes(1);
    const saved = repository.save.mock.calls[0][0].toPrimitives();
    expect(saved.firstName).toBe('Grace');
    expect(saved.gender.toPrimitive()).toBe('FEMALE');
    expect(saved.birthday.toPrimitive()).toBeInstanceOf(Date);
    expect(saved.profileCompleted).toBe(true);
    expect(result).toBe(user);
  });

  it('lanza NotFoundException si el usuario no existe', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(handler.execute(command(Cuid.random().value))).rejects.toThrow(
      NotFoundException,
    );
    expect(repository.save).not.toHaveBeenCalled();
  });
});
