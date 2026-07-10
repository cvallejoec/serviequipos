import type { EmailSender } from '../../src/contexts/iam/shared/domain/EmailSender';

/**
 * Doble de test del puerto `EmailSender`. Nunca envía correo real.
 */
export function createMockEmailSender(): jest.Mocked<EmailSender> {
  return {
    send: jest.fn(),
  };
}
