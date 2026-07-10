import type { ConfigService } from '@nestjs/config';

/**
 * Doble de test mínimo de `ConfigService`. Resuelve `getOrThrow`/`get` contra un
 * mapa de valores en memoria; `getOrThrow` lanza si la clave no está definida
 * (igual que el real). Solo se implementa lo que consumen los handlers bajo test.
 */
export function createMockConfigService(
  values: Record<string, string> = { FRONTEND_URL: 'https://app.test' },
): jest.Mocked<Pick<ConfigService, 'get' | 'getOrThrow'>> {
  return {
    get: jest.fn((key: string) => values[key]),
    getOrThrow: jest.fn((key: string) => {
      const value = values[key];
      if (value === undefined) {
        throw new Error(`Config key "${key}" no está definida`);
      }
      return value;
    }),
  } as unknown as jest.Mocked<Pick<ConfigService, 'get' | 'getOrThrow'>>;
}
