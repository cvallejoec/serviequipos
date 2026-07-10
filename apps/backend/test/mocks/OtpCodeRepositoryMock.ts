import type { OtpCodeRepository } from '../../src/contexts/iam/otp/domain/OtpCodeRepository';

/**
 * Doble de test del `OtpCodeRepository`. Cada método es un `jest.fn()` que el
 * test configura con `mockResolvedValue(...)` según el escenario.
 */
export function createMockOtpCodeRepository(): jest.Mocked<OtpCodeRepository> {
  return {
    save: jest.fn(),
    findValidByEmailAndCode: jest.fn(),
    markUsed: jest.fn(),
    countRecentByEmail: jest.fn(),
  };
}
