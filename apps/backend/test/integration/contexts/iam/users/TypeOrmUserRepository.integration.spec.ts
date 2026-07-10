import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { faker } from '@faker-js/faker/locale/en';
import { TypeOrmUserRepository } from '../../../../../src/contexts/iam/users/infrastructure/TypeOrmUserRepository';
import { DbUser } from '../../../../../src/database/entities/DbUser';
import { User } from '../../../../../src/contexts/iam/users/domain/User';
import { UserId } from '../../../../../src/contexts/iam/users/domain/value-objects/UserId';
import { UserEmail } from '../../../../../src/contexts/iam/users/domain/value-objects/UserEmail';
import { UserFirstName } from '../../../../../src/contexts/iam/users/domain/value-objects/UserFirstName';
import { UserLastName } from '../../../../../src/contexts/iam/users/domain/value-objects/UserLastName';
import { SystemClock } from '../../../../../src/common/domain/SystemClock';
import {
  testDatabaseConfig,
  cleanDatabase,
} from '../../../../test-database.module';

/**
 * Prueba de INTEGRACIÓN: ejercita `TypeOrmUserRepository` contra una base
 * Postgres real (definida por `TEST_DB_*`). Verifica el mapeo dominio ⇄
 * persistencia y las consultas de verdad, no mocks.
 *
 * Requiere una base de test levantada. Ver `test/README.md`.
 */
describe('TypeOrmUserRepository (integration)', () => {
  let module: TestingModule;
  let repository: TypeOrmUserRepository;
  let ormRepository: Repository<DbUser>;
  let dataSource: DataSource;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(testDatabaseConfig),
        TypeOrmModule.forFeature([DbUser]),
      ],
      providers: [TypeOrmUserRepository],
    }).compile();

    repository = module.get(TypeOrmUserRepository);
    ormRepository = module.get(getRepositoryToken(DbUser));
    dataSource = module.get(DataSource);
  });

  afterAll(async () => {
    if (dataSource?.isInitialized) await dataSource.destroy();
    await module?.close();
  });

  beforeEach(async () => {
    await cleanDatabase(dataSource);
  });

  const clock = new SystemClock();

  const buildUser = (overrides?: { email?: string }): User =>
    User.create(
      {
        id: new UserId(UserId.random().value),
        firstName: new UserFirstName('Ada'),
        lastName: new UserLastName('Lovelace'),
        // Email aleatorio (faker) por defecto para no chocar con la
        // restricción UNIQUE entre tests; salvo que el test fije uno.
        email: new UserEmail(
          overrides?.email ?? faker.internet.email().toLowerCase(),
        ),
      },
      clock,
    );

  describe('save', () => {
    it('persiste un usuario nuevo', async () => {
      const user = buildUser();
      await repository.save(user);

      const found = await ormRepository.findOne({
        where: { id: user.toPrimitives().id },
      });
      expect(found).not.toBeNull();
      expect(found?.email).toBe(user.toPrimitives().email);
    });

    it('actualiza un usuario existente (mismo id)', async () => {
      const user = buildUser();
      await repository.save(user);

      user.deactivate(clock);
      await repository.save(user);

      const found = await ormRepository.findOne({
        where: { id: user.toPrimitives().id },
      });
      expect(found?.status).toBe('INACTIVE');
      const count = await ormRepository.count();
      expect(count).toBe(1);
    });
  });

  describe('findById', () => {
    it('reconstruye el agregado desde persistencia', async () => {
      const user = buildUser();
      await repository.save(user);

      const found = await repository.findById(
        new UserId(user.toPrimitives().id),
      );

      expect(found).not.toBeNull();
      expect(found?.toPrimitives().email).toBe(user.toPrimitives().email);
      expect(found?.getId().value).toBe(user.toPrimitives().id);
    });

    it('devuelve null si no existe', async () => {
      const found = await repository.findById(
        new UserId(UserId.random().value),
      );
      expect(found).toBeNull();
    });
  });

  describe('findByEmail / existsByEmail', () => {
    it('encuentra por email', async () => {
      const user = buildUser({ email: 'grace@example.com' });
      await repository.save(user);

      const found = await repository.findByEmail(
        new UserEmail('grace@example.com'),
      );
      expect(found?.toPrimitives().id).toBe(user.toPrimitives().id);
    });

    it('existsByEmail refleja la presencia', async () => {
      await repository.save(buildUser({ email: 'x@example.com' }));

      expect(
        await repository.existsByEmail(new UserEmail('x@example.com')),
      ).toBe(true);
      expect(
        await repository.existsByEmail(new UserEmail('nadie@example.com')),
      ).toBe(false);
    });
  });

  describe('findByIds', () => {
    it('devuelve solo los usuarios pedidos', async () => {
      const a = buildUser({ email: 'a@example.com' });
      const b = buildUser({ email: 'b@example.com' });
      const c = buildUser({ email: 'c@example.com' });
      await repository.save(a);
      await repository.save(b);
      await repository.save(c);

      const found = await repository.findByIds([
        new UserId(a.toPrimitives().id),
        new UserId(c.toPrimitives().id),
      ]);

      const ids = found.map((u) => u.toPrimitives().id).sort();
      expect(ids).toEqual([a.toPrimitives().id, c.toPrimitives().id].sort());
    });

    it('devuelve arreglo vacío si no se pasan ids', async () => {
      expect(await repository.findByIds([])).toEqual([]);
    });
  });

  describe('delete', () => {
    it('elimina el usuario', async () => {
      const user = buildUser();
      await repository.save(user);

      await repository.delete(new UserId(user.toPrimitives().id));

      const found = await repository.findById(
        new UserId(user.toPrimitives().id),
      );
      expect(found).toBeNull();
    });
  });
});
