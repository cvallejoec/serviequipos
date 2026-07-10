import { LookupUsersByIdsQueryHandler } from '../../../../../src/contexts/iam/users/application/finder/LookupUsersByIdsQueryHandler';
import { LookupUsersByIdsQuery } from '../../../../../src/contexts/iam/users/application/finder/LookupUsersByIdsQuery';
import { createMockUserRepository } from '../../../../mocks/UserRepositoryMock';
import { UserBuilder } from '../../../../builders/UserBuilder';
import { Cuid } from '../../../../../src/common/domain/Cuid';

describe('LookupUsersByIdsQueryHandler', () => {
  const repository = createMockUserRepository();
  const handler = new LookupUsersByIdsQueryHandler(repository);

  beforeEach(() => jest.clearAllMocks());

  it('devuelve los usuarios resueltos por el repositorio', async () => {
    const first = UserBuilder.aUser().build();
    const second = UserBuilder.aUser().build();
    repository.findByIds.mockResolvedValue([first, second]);

    const result = await handler.execute(
      new LookupUsersByIdsQuery([
        first.toPrimitives().id,
        second.toPrimitives().id,
      ]),
    );

    expect(result).toEqual([first, second]);
  });

  it('mapea cada id primitivo a un UserId antes de consultar', async () => {
    repository.findByIds.mockResolvedValue([]);
    const ids = [Cuid.random().value, Cuid.random().value];

    await handler.execute(new LookupUsersByIdsQuery(ids));

    const passed = repository.findByIds.mock.calls[0][0];
    expect(passed).toHaveLength(2);
    expect(passed.map((id) => id.value)).toEqual(ids);
  });

  it('devuelve una lista vacía cuando no llegan ids', async () => {
    repository.findByIds.mockResolvedValue([]);

    const result = await handler.execute(new LookupUsersByIdsQuery([]));

    expect(result).toEqual([]);
    expect(repository.findByIds).toHaveBeenCalledWith([]);
  });
});
