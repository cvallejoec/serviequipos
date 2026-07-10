const { base, swcTransform } = require('./jest.preset');

/**
 * Pruebas E2E: levantan la app Nest (módulo de test aislado) y golpean los
 * endpoints HTTP con supertest, contra la base Postgres de test.
 * Serializadas (`maxWorkers: 1`) por el esquema compartido.
 * Transpilan con SWC (misma cadena que el build de producción).
 *
 * @type {import('jest').Config}
 */
module.exports = {
  ...base,
  rootDir: '.',
  testRegex: '.e2e-spec.ts$',
  transform: { '^.+\\.(t|j)s$': swcTransform },
  setupFiles: ['<rootDir>/setup/load-env.ts'],
  testTimeout: 30000,
  maxWorkers: 1,
};
