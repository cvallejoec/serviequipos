import { Test, TestingModule } from '@nestjs/testing';
import {
  INestApplication,
  UnauthorizedException,
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { DataSource } from 'typeorm';
import request from 'supertest';
import type { Server } from 'http';
import sharp from 'sharp';
import { MeController } from '../../../../src/api/v1/controllers/MeController';
import { USER_REPOSITORY } from '../../../../src/contexts/iam/users/domain/UserRepository';
import type { UserRepository } from '../../../../src/contexts/iam/users/domain/UserRepository';
import { FILE_STORAGE } from '../../../../src/contexts/platform/storage/domain/FileStorage';
import type { FileStorage } from '../../../../src/contexts/platform/storage/domain/FileStorage';
import { User } from '../../../../src/contexts/iam/users/domain/User';
import { UserId } from '../../../../src/contexts/iam/users/domain/value-objects/UserId';
import { UserFirstName } from '../../../../src/contexts/iam/users/domain/value-objects/UserFirstName';
import { UserLastName } from '../../../../src/contexts/iam/users/domain/value-objects/UserLastName';
import { UserEmail } from '../../../../src/contexts/iam/users/domain/value-objects/UserEmail';
import { SystemClock } from '../../../../src/common/domain/SystemClock';
import { GlobalExceptionFilter } from '../../../../src/common/filters/global-exception.filter';
import { TestAppModule } from '../../setup/test-app.module';
import { cleanDatabase } from '../../../test-database.module';

/**
 * E2E de `MeController` (`/me`, protegido por jwt). Cubre perfil (leer/
 * actualizar) y cambio de avatar (procesado real con sharp, storage
 * mockeado). La guarda jwt se sobreescribe para inyectar el usuario.
 */
describe('Me (e2e)', () => {
  let app: INestApplication<Server>;
  let dataSource: DataSource;
  let repository: UserRepository;
  let fileStorage: jest.Mocked<FileStorage>;
  let pngBuffer: Buffer;

  let authUser: { sub: string; email: string } | null = null;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [TestAppModule],
      controllers: [MeController],
    })
      .overrideGuard(AuthGuard('jwt'))
      .useValue({
        canActivate: (context: {
          switchToHttp: () => { getRequest: () => { user?: unknown } };
        }) => {
          if (authUser === null) throw new UnauthorizedException();
          context.switchToHttp().getRequest().user = authUser;
          return true;
        },
      })
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    app.useGlobalFilters(new GlobalExceptionFilter());
    await app.init();

    dataSource = moduleFixture.get(DataSource);
    repository = moduleFixture.get(USER_REPOSITORY);
    fileStorage = moduleFixture.get(FILE_STORAGE);

    // Imagen PNG real para ejercitar el procesamiento con sharp.
    pngBuffer = await sharp({
      create: {
        width: 64,
        height: 64,
        channels: 3,
        background: { r: 200, g: 100, b: 50 },
      },
    })
      .png()
      .toBuffer();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await cleanDatabase(dataSource);
    jest.clearAllMocks();
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
    authUser = {
      sub: user.toPrimitives().id,
      email: user.toPrimitives().email,
    };
    return user;
  };

  describe('GET /me/profile', () => {
    it('devuelve el perfil del usuario autenticado', async () => {
      await seedUser();

      const response = await request(app.getHttpServer())
        .get('/me/profile')
        .expect(200);

      expect(response.body.email).toBe('ada@example.com');
      expect(response.body.profileCompleted).toBe(false);
    });

    it('responde 401 sin autenticación', async () => {
      await request(app.getHttpServer()).get('/me/profile').expect(401);
    });

    it('responde 404 si el usuario no existe', async () => {
      authUser = { sub: UserId.random().value, email: 'ghost@example.com' };
      await request(app.getHttpServer()).get('/me/profile').expect(404);
    });
  });

  describe('PATCH /me/profile', () => {
    it('actualiza el perfil y lo persiste', async () => {
      const user = await seedUser();

      const response = await request(app.getHttpServer())
        .patch('/me/profile')
        .send({
          firstName: 'Grace',
          lastName: 'Hopper',
          phone: '+593987654321',
          gender: 'FEMALE',
          birthday: '1990-05-20',
        })
        .expect(200);

      expect(response.body.firstName).toBe('Grace');
      expect(response.body.gender).toBe('FEMALE');
      expect(response.body.birthday).toBe('1990-05-20');
      expect(response.body.profileCompleted).toBe(true);

      const reloaded = await repository.findById(
        new UserId(user.toPrimitives().id),
      );
      expect(reloaded?.toPrimitives().profileCompleted).toBe(true);
    });

    it('rechaza un teléfono inválido (400)', async () => {
      await seedUser();

      await request(app.getHttpServer())
        .patch('/me/profile')
        .send({
          firstName: 'Grace',
          lastName: 'Hopper',
          phone: '099',
          gender: 'FEMALE',
          birthday: '1990-05-20',
        })
        .expect(400);
    });
  });

  describe('PATCH /me/avatar', () => {
    it('procesa y sube la imagen, y guarda la URL del storage', async () => {
      await seedUser();

      const response = await request(app.getHttpServer())
        .patch('/me/avatar')
        .attach('avatar', pngBuffer, {
          filename: 'avatar.png',
          contentType: 'image/png',
        })
        .expect(200);

      expect(fileStorage.upload).toHaveBeenCalledTimes(1);
      expect(response.body.avatar).toBe('https://cdn.test/test/key');
    });

    it('responde 400 si no se adjunta imagen', async () => {
      await seedUser();

      await request(app.getHttpServer()).patch('/me/avatar').expect(400);
      expect(fileStorage.upload).not.toHaveBeenCalled();
    });
  });
});
