import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import request from 'supertest';
import type { Server } from 'http';
import { HealthModule } from '../../src/health/health.module';
import { ClockModule } from '../../src/common/application/clock.module';
import { testDatabaseConfig } from '../test-database.module';

/**
 * E2E del endpoint de salud. Verifica el contrato HTTP y que el chequeo
 * de base de datos responde `up` contra la conexión real de test.
 */
describe('Health (e2e)', () => {
  let app: INestApplication<Server>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ClockModule,
        TypeOrmModule.forRoot(testDatabaseConfig),
        HealthModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /health responde ok con la db arriba', async () => {
    const response = await request(app.getHttpServer())
      .get('/health')
      .expect(200);

    expect(response.body.status).toBe('ok');
    expect(response.body.services.db.status).toBe('up');
    expect(response.body.timestamp).toBeDefined();
  });
});
