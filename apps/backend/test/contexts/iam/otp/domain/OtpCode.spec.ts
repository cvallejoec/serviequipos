import {
  OtpCode,
  OtpCodePrimitives,
} from '../../../../../src/contexts/iam/otp/domain/OtpCode';
import { OtpCodeId } from '../../../../../src/contexts/iam/otp/domain/value-objects/OtpCodeId';
import { OtpCodeEmail } from '../../../../../src/contexts/iam/otp/domain/value-objects/OtpCodeEmail';
import { OtpCodeValue } from '../../../../../src/contexts/iam/otp/domain/value-objects/OtpCodeValue';
import { Maybe } from '../../../../../src/common/domain/Maybe';
import { OtpCodeBuilder } from '../../../../builders/OtpCodeBuilder';
import { FixedClock, FIXED_NOW } from '../../../../mocks/ClockMock';

describe('OtpCode', () => {
  // Id fijo para que el objeto completo sea determinista y se pueda asertar
  // con un único `toEqual` junto al reloj fijo.
  const FIXED_ID = 'clh1234567890abcdefghijkl';

  const createParams = (ttlMinutes = 10) => ({
    id: new OtpCodeId(FIXED_ID),
    email: new OtpCodeEmail('ada@example.com'),
    code: new OtpCodeValue('123456'),
    ttlMinutes,
  });

  describe('create', () => {
    it('crea un código sin usar con expiresAt a ttlMinutes del reloj', () => {
      const ttlMinutes = 10;
      const clock = new FixedClock();
      const otp = OtpCode.create(createParams(ttlMinutes), clock);

      expect(otp.toPrimitives()).toEqual({
        id: FIXED_ID,
        email: 'ada@example.com',
        code: '123456',
        expiresAt: new Date(FIXED_NOW.getTime() + ttlMinutes * 60 * 1000),
        usedAt: Maybe.none(),
        createdAt: FIXED_NOW,
      });
    });

    it('no registra eventos de dominio al crearse', () => {
      const clock = new FixedClock();
      const otp = OtpCode.create(createParams(), clock);
      expect(otp.pullDomainEvents()).toHaveLength(0);
    });
  });

  describe('markUsed', () => {
    it('marca el código como usado fijando usedAt con la fecha del reloj', () => {
      const ttlMinutes = 10;
      const clock = new FixedClock();
      const otp = OtpCode.create(createParams(ttlMinutes), clock);

      otp.markUsed(clock);

      expect(otp.toPrimitives()).toEqual({
        id: FIXED_ID,
        email: 'ada@example.com',
        code: '123456',
        expiresAt: new Date(FIXED_NOW.getTime() + ttlMinutes * 60 * 1000),
        usedAt: Maybe.some(FIXED_NOW),
        createdAt: FIXED_NOW,
      });
    });
  });

  describe('fromPrimitives / toPrimitives', () => {
    it('hace round-trip sin perder información (sin usar)', () => {
      const original: OtpCodePrimitives = OtpCodeBuilder.anOtpCode()
        .withEmail('grace@example.com')
        .withCode('654321')
        .buildPrimitives();

      const roundTripped = OtpCode.fromPrimitives(original).toPrimitives();

      expect(roundTripped.id).toBe(original.id);
      expect(roundTripped.email).toBe(original.email);
      expect(roundTripped.code).toBe(original.code);
      expect(roundTripped.expiresAt).toEqual(original.expiresAt);
      expect(roundTripped.createdAt).toEqual(original.createdAt);
      expect(roundTripped.usedAt.isEmpty()).toBe(true);
    });

    it('conserva usedAt cuando el código ya fue usado', () => {
      const usedAt = new Date('2026-01-01T00:05:00.000Z');
      const original = OtpCodeBuilder.anOtpCode()
        .withUsedAt(usedAt)
        .buildPrimitives();

      const roundTripped = OtpCode.fromPrimitives(original).toPrimitives();

      expect(roundTripped.usedAt.isDefined()).toBe(true);
      expect(roundTripped.usedAt.toPrimitive()).toEqual(usedAt);
    });

    it('reconstruye correctamente un usedAt vacío (Maybe.none)', () => {
      const original = OtpCodeBuilder.anOtpCode()
        .withUsedAt(null)
        .buildPrimitives();
      expect(original.usedAt).toBeInstanceOf(Maybe);

      const roundTripped = OtpCode.fromPrimitives(original).toPrimitives();
      expect(roundTripped.usedAt.isEmpty()).toBe(true);
    });
  });
});
