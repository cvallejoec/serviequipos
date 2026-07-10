import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ClockModule } from '../../../../../src/common/application/clock.module';
import { TypeOrmOtpCodeRepository } from '../../../../../src/contexts/iam/otp/infrastructure/TypeOrmOtpCodeRepository';
import { DbOtpCode } from '../../../../../src/database/entities/DbOtpCode';
import { OtpCode } from '../../../../../src/contexts/iam/otp/domain/OtpCode';
import { OtpCodeId } from '../../../../../src/contexts/iam/otp/domain/value-objects/OtpCodeId';
import { OtpCodeEmail } from '../../../../../src/contexts/iam/otp/domain/value-objects/OtpCodeEmail';
import { OtpCodeValue } from '../../../../../src/contexts/iam/otp/domain/value-objects/OtpCodeValue';
import { Maybe } from '../../../../../src/common/domain/Maybe';
import {
  testDatabaseConfig,
  cleanDatabase,
} from '../../../../test-database.module';

/**
 * Integración de `TypeOrmOtpCodeRepository` contra Postgres real. Verifica el
 * mapeo dominio⇄persistencia y, sobre todo, el filtro de `findValidByEmailAndCode`
 * (no usado + no expirado) que es la invariante de seguridad del OTP.
 */
describe('TypeOrmOtpCodeRepository (integration)', () => {
  let module: TestingModule;
  let repository: TypeOrmOtpCodeRepository;
  let ormRepository: Repository<DbOtpCode>;
  let dataSource: DataSource;

  const EMAIL = 'otp@example.com';
  const CODE = '123456';

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        ClockModule,
        TypeOrmModule.forRoot(testDatabaseConfig),
        TypeOrmModule.forFeature([DbOtpCode]),
      ],
      providers: [TypeOrmOtpCodeRepository],
    }).compile();

    repository = module.get(TypeOrmOtpCodeRepository);
    ormRepository = module.get(getRepositoryToken(DbOtpCode));
    dataSource = module.get(DataSource);
  });

  afterAll(async () => {
    if (dataSource?.isInitialized) await dataSource.destroy();
    await module?.close();
  });

  beforeEach(async () => {
    await cleanDatabase(dataSource);
  });

  // Construye vía fromPrimitives para controlar expiración y uso.
  const buildOtp = (overrides?: {
    email?: string;
    code?: string;
    expiresAt?: Date;
    usedAt?: Date | null;
    createdAt?: Date;
  }): OtpCode => {
    const now = new Date();
    return OtpCode.fromPrimitives({
      id: OtpCodeId.random().value,
      email: overrides?.email ?? EMAIL,
      code: overrides?.code ?? CODE,
      expiresAt: overrides?.expiresAt ?? new Date(now.getTime() + 600_000),
      usedAt: Maybe.fromValue(overrides?.usedAt ?? null),
      createdAt: overrides?.createdAt ?? now,
    });
  };

  describe('save', () => {
    it('persiste un código OTP', async () => {
      const otp = buildOtp();
      await repository.save(otp);

      const found = await ormRepository.findOne({
        where: { id: otp.toPrimitives().id },
      });
      expect(found).not.toBeNull();
      expect(found?.email).toBe(EMAIL);
      expect(found?.code).toBe(CODE);
      expect(found?.usedAt).toBeNull();
    });
  });

  describe('findValidByEmailAndCode', () => {
    it('encuentra un OTP vigente y sin usar', async () => {
      await repository.save(buildOtp());

      const found = await repository.findValidByEmailAndCode(
        new OtpCodeEmail(EMAIL),
        new OtpCodeValue(CODE),
      );
      expect(found).not.toBeNull();
      expect(found?.toPrimitives().email).toBe(EMAIL);
    });

    it('devuelve null si el código expiró', async () => {
      await repository.save(
        buildOtp({ expiresAt: new Date(Date.now() - 1000) }),
      );

      const found = await repository.findValidByEmailAndCode(
        new OtpCodeEmail(EMAIL),
        new OtpCodeValue(CODE),
      );
      expect(found).toBeNull();
    });

    it('devuelve null si el código ya fue usado', async () => {
      await repository.save(buildOtp({ usedAt: new Date() }));

      const found = await repository.findValidByEmailAndCode(
        new OtpCodeEmail(EMAIL),
        new OtpCodeValue(CODE),
      );
      expect(found).toBeNull();
    });

    it('devuelve null si el código no coincide', async () => {
      await repository.save(buildOtp({ code: '111111' }));

      const found = await repository.findValidByEmailAndCode(
        new OtpCodeEmail(EMAIL),
        new OtpCodeValue('999999'),
      );
      expect(found).toBeNull();
    });

    it('devuelve null si el email no coincide', async () => {
      await repository.save(buildOtp());

      const found = await repository.findValidByEmailAndCode(
        new OtpCodeEmail('otro@example.com'),
        new OtpCodeValue(CODE),
      );
      expect(found).toBeNull();
    });
  });

  describe('markUsed', () => {
    it('marca el OTP como usado y deja de ser válido', async () => {
      const otp = buildOtp();
      await repository.save(otp);

      await repository.markUsed(new OtpCodeId(otp.toPrimitives().id));

      const raw = await ormRepository.findOne({
        where: { id: otp.toPrimitives().id },
      });
      expect(raw?.usedAt).not.toBeNull();

      const found = await repository.findValidByEmailAndCode(
        new OtpCodeEmail(EMAIL),
        new OtpCodeValue(CODE),
      );
      expect(found).toBeNull();
    });
  });

  describe('countRecentByEmail', () => {
    // Nota: `created_at` es `timestamp` sin zona; comparar contra un `Date` como
    // parámetro es sensible al offset del proceso (ver AGENTS.md). Por eso este
    // caso de negocio usa un corte holgado en el pasado (1h) y aísla por email,
    // sin depender del borde exacto now±ε.
    it('cuenta solo los OTP del email dado dentro de la ventana', async () => {
      await repository.save(buildOtp());
      await repository.save(buildOtp({ code: '222222' }));
      await repository.save(buildOtp({ email: 'otro@example.com' }));

      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      expect(
        await repository.countRecentByEmail(
          new OtpCodeEmail(EMAIL),
          oneHourAgo,
        ),
      ).toBe(2);
      expect(
        await repository.countRecentByEmail(
          new OtpCodeEmail('otro@example.com'),
          oneHourAgo,
        ),
      ).toBe(1);
    });

    it('no cuenta OTP de un email sin envíos', async () => {
      await repository.save(buildOtp());

      const count = await repository.countRecentByEmail(
        new OtpCodeEmail('nadie@example.com'),
        new Date(Date.now() - 60 * 60 * 1000),
      );
      expect(count).toBe(0);
    });
  });
});
