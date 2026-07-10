import { OtpCodeMapper } from '../../../../../src/contexts/iam/otp/infrastructure/OtpCodeMapper';
import { DbOtpCode } from '../../../../../src/database/entities/DbOtpCode';
import { OtpCodeBuilder } from '../../../../builders/OtpCodeBuilder';

describe('OtpCodeMapper', () => {
  const buildDb = (overrides: Partial<DbOtpCode> = {}): DbOtpCode => {
    const db = new DbOtpCode();
    db.id = OtpCodeBuilder.anOtpCode().buildPrimitives().id;
    db.email = 'ada@example.com';
    db.code = '123456';
    db.expiresAt = new Date('2026-01-01T00:10:00.000Z');
    db.usedAt = null;
    db.createdAt = new Date('2026-01-01T00:00:00.000Z');
    return Object.assign(db, overrides);
  };

  describe('toDomain', () => {
    it('mapea una fila sin usar a un OtpCode', () => {
      const db = buildDb();

      const domain = OtpCodeMapper.toDomain(db);
      const primitives = domain.toPrimitives();

      expect(primitives.id).toBe(db.id);
      expect(primitives.email).toBe(db.email);
      expect(primitives.code).toBe(db.code);
      expect(primitives.expiresAt).toEqual(db.expiresAt);
      expect(primitives.createdAt).toEqual(db.createdAt);
      expect(primitives.usedAt.isEmpty()).toBe(true);
    });

    it('envuelve usedAt en Maybe cuando la fila está usada', () => {
      const usedAt = new Date('2026-01-01T00:05:00.000Z');
      const db = buildDb({ usedAt });

      const primitives = OtpCodeMapper.toDomain(db).toPrimitives();

      expect(primitives.usedAt.isDefined()).toBe(true);
      expect(primitives.usedAt.toPrimitive()).toEqual(usedAt);
    });
  });

  describe('toPersistence', () => {
    it('mapea un OtpCode a una fila DbOtpCode', () => {
      const otp = OtpCodeBuilder.anOtpCode()
        .withEmail('grace@example.com')
        .withCode('654321')
        .build();
      const primitives = otp.toPrimitives();

      const db = OtpCodeMapper.toPersistence(otp);

      expect(db).toBeInstanceOf(DbOtpCode);
      expect(db.id).toBe(primitives.id);
      expect(db.email).toBe('grace@example.com');
      expect(db.code).toBe('654321');
      expect(db.expiresAt).toEqual(primitives.expiresAt);
      // Sin usar => usedAt null en persistencia.
      expect(db.usedAt).toBeNull();
    });

    it('propaga usedAt cuando el OtpCode está usado', () => {
      const usedAt = new Date('2026-01-01T00:05:00.000Z');
      const otp = OtpCodeBuilder.anOtpCode().withUsedAt(usedAt).build();

      const db = OtpCodeMapper.toPersistence(otp);

      expect(db.usedAt).toEqual(usedAt);
    });
  });

  describe('round-trip', () => {
    it('db -> dominio -> db conserva los campos', () => {
      const original = buildDb({
        usedAt: new Date('2026-01-01T00:05:00.000Z'),
      });

      const roundTripped = OtpCodeMapper.toPersistence(
        OtpCodeMapper.toDomain(original),
      );

      expect(roundTripped.id).toBe(original.id);
      expect(roundTripped.email).toBe(original.email);
      expect(roundTripped.code).toBe(original.code);
      expect(roundTripped.expiresAt).toEqual(original.expiresAt);
      expect(roundTripped.usedAt).toEqual(original.usedAt);
      // `toPersistence` no fija createdAt: lo gestiona la BD (@CreateDateColumn).
      expect(roundTripped.createdAt).toBeUndefined();
    });
  });
});
