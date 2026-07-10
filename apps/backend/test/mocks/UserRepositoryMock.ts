import type { UserRepository } from '../../src/contexts/iam/users/domain/UserRepository';

/**
 * Doble de test del `UserRepository`. Cada método es un `jest.fn()` que el
 * test configura con `mockResolvedValue(...)` según el escenario.
 */
export function createMockUserRepository(): jest.Mocked<UserRepository> {
  return {
    save: jest.fn(),
    findById: jest.fn(),
    findByIds: jest.fn(),
    findByEmail: jest.fn(),
    existsByEmail: jest.fn(),
    delete: jest.fn(),
  };
}
