import { FindUserByIdQueryHandler } from '../../../../../src/contexts/iam/users/application/finder/FindUserByIdQueryHandler';
import { FindUserByIdQuery } from '../../../../../src/contexts/iam/users/application/finder/FindUserByIdQuery';
import { UserNotFound } from '../../../../../src/contexts/iam/users/domain/errors/UserNotFound';
import { createMockUserRepository } from '../../../../mocks/UserRepositoryMock';
import { UserBuilder } from '../../../../builders/UserBuilder';
import { Cuid } from '../../../../../src/common/domain/Cuid';

describe('FindUserByIdQueryHandler', () => {
  const repository = createMockUserRepository();
  const handler = new FindUserByIdQueryHandler(repository);

  beforeEach(() => jest.clearAllMocks());

  it('devuelve el usuario cuando existe', async () => {
    const user = UserBuilder.aUser().build();
    repository.findById.mockResolvedValue(user);

    const result = await handler.execute(
      new FindUserByIdQuery(user.toPrimitives().id),
    );

    expect(result).toBe(user);
    expect(repository.findById).toHaveBeenCalledTimes(1);
    expect(repository.findById.mock.calls[0][0].value).toBe(
      user.toPrimitives().id,
    );
  });

  it('lanza UserNotFound cuando no existe', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(
      handler.execute(new FindUserByIdQuery(Cuid.random().value)),
    ).rejects.toThrow(UserNotFound);
  });
});
