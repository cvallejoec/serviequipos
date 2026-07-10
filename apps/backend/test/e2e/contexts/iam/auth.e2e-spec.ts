import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { DataSource } from 'typeorm';
import request from 'supertest';
import type { Server } from 'http';
import { AuthController } from '../../../../src/api/v1/controllers/AuthController';
import { OTP_CODE_REPOSITORY } from '../../../../src/contexts/iam/otp/domain/OtpCodeRepository';
import type { OtpCodeRepository } from '../../../../src/contexts/iam/otp/domain/OtpCodeRepository';
import { OtpCode } from '../../../../src/contexts/iam/otp/domain/OtpCode';
import { OtpCodeId } from '../../../../src/contexts/iam/otp/domain/value-objects/OtpCodeId';
import { OtpCodeEmail } from '../../../../src/contexts/iam/otp/domain/value-objects/OtpCodeEmail';
import { OtpCodeValue } from '../../../../src/contexts/iam/otp/domain/value-objects/OtpCodeValue';
import { EMAIL_SENDER } from '../../../../src/contexts/iam/shared/domain/EmailSender';
import type { EmailSender } from '../../../../src/contexts/iam/shared/domain/EmailSender';
import { SystemClock } from '../../../../src/common/domain/SystemClock';
import { GlobalExceptionFilter } from '../../../../src/common/filters/global-exception.filter';
import { TestAppModule } from '../../setup/test-app.module';
import { cleanDatabase } from '../../../test-database.module';

/**
 * E2E del flujo OTP de `AuthController` (`iam/auth`): solicitar código y
 * autenticarse con él. Los callbacks OAuth (Google/Microsoft) dependen de
 * Passport + proveedores externos y quedan fuera del alcance e2e.
 */
describe('Auth OTP (e2e)', () => {
  let app: INestApplication<Server>;
  let dataSource: DataSource;
  let otpRepository: OtpCodeRepository;
  let emailSender: jest.Mocked<EmailSender>;

  const EMAIL = 'login@example.com';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [TestAppModule],
      controllers: [AuthController],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    app.useGlobalFilters(new GlobalExceptionFilter());
    await app.init();

    dataSource = moduleFixture.get(DataSource);
    otpRepository = moduleFixture.get(OTP_CODE_REPOSITORY);
    emailSender = moduleFixture.get(EMAIL_SENDER);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await cleanDatabase(dataSource);
    jest.clearAllMocks();
  });

  // Siembra un OTP vigente con código conocido (el real es aleatorio).
  const seedOtp = async (code = '123456'): Promise<void> => {
    await otpRepository.save(
      OtpCode.create(
        {
          id: new OtpCodeId(OtpCodeId.random().value),
          email: new OtpCodeEmail(EMAIL),
          code: new OtpCodeValue(code),
          ttlMinutes: 10,
        },
        new SystemClock(),
      ),
    );
  };

  describe('POST /iam/auth/otp/request', () => {
    it('genera un OTP, lo persiste y envía el correo', async () => {
      const response = await request(app.getHttpServer())
        .post('/iam/auth/otp/request')
        .send({ email: EMAIL })
        .expect(200);

      expect(response.body).toEqual({ success: true });
      expect(emailSender.send).toHaveBeenCalledTimes(1);
      expect(emailSender.send.mock.calls[0][0].to).toBe(EMAIL);

      const count = await otpRepository.countRecentByEmail(
        new OtpCodeEmail(EMAIL),
        new Date(Date.now() - 60 * 60 * 1000),
      );
      expect(count).toBe(1);
    });

    it('rechaza un email inválido (400) sin enviar correo', async () => {
      await request(app.getHttpServer())
        .post('/iam/auth/otp/request')
        .send({ email: 'no-es-email' })
        .expect(400);
      expect(emailSender.send).not.toHaveBeenCalled();
    });
  });

  describe('POST /iam/auth/otp/verify', () => {
    it('autentica con un código válido y crea el usuario si no existe', async () => {
      await seedOtp('123456');

      const response = await request(app.getHttpServer())
        .post('/iam/auth/otp/verify')
        .send({ email: EMAIL, code: '123456' })
        .expect(200);

      expect(response.body.accessToken).toEqual(expect.any(String));
      expect(response.body.user.email).toBe(EMAIL);
      expect(response.body.user.profileCompleted).toBe(false);
    });

    it('rechaza un código incorrecto (400)', async () => {
      await seedOtp('123456');

      await request(app.getHttpServer())
        .post('/iam/auth/otp/verify')
        .send({ email: EMAIL, code: '000000' })
        .expect(400);
    });

    it('un código solo sirve una vez (segundo intento 400)', async () => {
      await seedOtp('123456');

      await request(app.getHttpServer())
        .post('/iam/auth/otp/verify')
        .send({ email: EMAIL, code: '123456' })
        .expect(200);

      await request(app.getHttpServer())
        .post('/iam/auth/otp/verify')
        .send({ email: EMAIL, code: '123456' })
        .expect(400);
    });

    it('rechaza un código con formato inválido (400, validación DTO)', async () => {
      await request(app.getHttpServer())
        .post('/iam/auth/otp/verify')
        .send({ email: EMAIL, code: '12' })
        .expect(400);
    });
  });
});
