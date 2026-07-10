import { Test, TestingModule } from '@nestjs/testing';
import {
  INestApplication,
  UnauthorizedException,
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GlobalExceptionFilter } from '../../../../src/common/filters/global-exception.filter';
import { DataSource } from 'typeorm';
import request from 'supertest';
import type { Server } from 'http';
import { UsersController } from '../../../../src/api/v1/controllers/UsersController';
import { USER_REPOSITORY } from '../../../../src/contexts/iam/users/domain/UserRepository';
import type { UserRepository } from '../../../../src/contexts/iam/users/domain/UserRepository';
import { User } from '../../../../src/contexts/iam/users/domain/User';
import { UserId } from '../../../../src/contexts/iam/users/domain/value-objects/UserId';
import { UserFirstName } from '../../../../src/contexts/iam/users/domain/value-objects/UserFirstName';
import { UserLastName } from '../../../../src/contexts/iam/users/domain/value-objects/UserLastName';
import { UserEmail } from '../../../../src/contexts/iam/users/domain/value-objects/UserEmail';
import { SystemClock } from '../../../../src/common/domain/SystemClock';
import { TestAppModule } from '../../setup/test-app.module';
import { cleanDatabase } from '../../../test-database.module';

/**
 * E2E del contexto IAM/users a través de `UsersController`.
 *
 * La guarda `AuthGuard('jwt')` se sobreescribe por un doble que inyecta el
 * usuario "autenticado" (`req.user`) que cada test necesita — así probamos
 * la lógica del endpoint sin montar el flujo real de JWT/OAuth.
 */
describe('IAM Users (e2e)', () => {
  let app: INestApplication<Server>;
  let dataSource: DataSource;
  let repository: UserRepository;

  // El usuario "autenticado" que la guarda inyectará en cada request.
  let authUser: { sub: string; email: string } | null = null;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [TestAppModule],
      controllers: [UsersController],
    })
      .overrideGuard(AuthGuard('jwt'))
      .useValue({
        canActivate: (context: {
          switchToHttp: () => { getRequest: () => { user?: unknown } };
        }) => {
          // Reproduce el jwt guard real: sin usuario => 401.
          if (authUser === null) throw new UnauthorizedException();
          context.switchToHttp().getRequest().user = authUser;
          return true;
        },
      })
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );
    // Mismo filtro global que en producción: mapea DomainError -> HTTP status.
    app.useGlobalFilters(new GlobalExceptionFilter());
    await app.init();

    dataSource = moduleFixture.get(DataSource);
    repository = moduleFixture.get(USER_REPOSITORY);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await cleanDatabase(dataSource);
    authUser = null;
  });

  const seedUser = async (): Promise<User> => {
    const user = User.create(
      {
        id: new UserId(UserId.random().value),
        firstName: new UserFirstName('Ada'),
        lastName: new UserLastName('Lovelace'),
        email: new UserEmail('ada@example.com'),
      },
      new SystemClock(),
    );
    await repository.save(user);
    return user;
  };

  const authenticateAs = (user: User) => {
    const p = user.toPrimitives();
    authUser = { sub: p.id, email: p.email };
  };

  describe('GET /iam/users/me', () => {
    it('devuelve el perfil del usuario autenticado', async () => {
      const user = await seedUser();
      authenticateAs(user);

      const response = await request(app.getHttpServer())
        .get('/iam/users/me')
        .expect(200);

      expect(response.body.id).toBe(user.toPrimitives().id);
      expect(response.body.email).toBe('ada@example.com');
      expect(response.body.profileCompleted).toBe(false);
    });

    it('responde 401 si no hay usuario autenticado', async () => {
      await request(app.getHttpServer()).get('/iam/users/me').expect(401);
    });

    it('responde 404 si el usuario autenticado no existe en la base', async () => {
      authUser = { sub: UserId.random().value, email: 'ghost@example.com' };

      await request(app.getHttpServer()).get('/iam/users/me').expect(404);
    });
  });

  describe('POST /iam/users/me/profile', () => {
    it('completa el perfil y lo persiste', async () => {
      const user = await seedUser();
      authenticateAs(user);

      const response = await request(app.getHttpServer())
        .post('/iam/users/me/profile')
        .send({
          firstName: 'Grace',
          lastName: 'Hopper',
          phone: '+593987654321',
        })
        .expect(200);

      expect(response.body.profileCompleted).toBe(true);
      expect(response.body.firstName).toBe('Grace');
      expect(response.body.phone).toBe('+593987654321');

      // Se persistió de verdad: una nueva lectura lo refleja.
      const reloaded = await repository.findById(
        new UserId(user.toPrimitives().id),
      );
      expect(reloaded?.toPrimitives().profileCompleted).toBe(true);
    });

    it('rechaza un teléfono con formato inválido (400)', async () => {
      const user = await seedUser();
      authenticateAs(user);

      await request(app.getHttpServer())
        .post('/iam/users/me/profile')
        .send({ firstName: 'Grace', lastName: 'Hopper', phone: '099' })
        .expect(400);
    });

    it('rechaza campos no permitidos (400)', async () => {
      const user = await seedUser();
      authenticateAs(user);

      await request(app.getHttpServer())
        .post('/iam/users/me/profile')
        .send({
          firstName: 'Grace',
          lastName: 'Hopper',
          phone: '+593987654321',
          role: 'admin',
        })
        .expect(400);
    });
  });
});
