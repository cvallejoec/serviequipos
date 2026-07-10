const { base, swcTransform } = require('./jest.preset');

/**
 * Pruebas de INTEGRACIÓN: ejercitan repositorios TypeORM contra una base
 * Postgres real (`TEST_DB_*`, cargadas en `setup/load-env.ts`). Serializadas
 * (`maxWorkers: 1`) para evitar carreras sobre el esquema compartido.
 * Transpilan con SWC (misma cadena que el build de producción).
 *
 * @type {import('jest').Config}
 */
module.exports = {
  ...base,
  rootDir: '.',
  testRegex: '.integration.spec.ts$',
  transform: { '^.+\\.(t|j)s$': swcTransform },
  setupFiles: ['<rootDir>/setup/load-env.ts'],
  testTimeout: 30000,
  maxWorkers: 1,
};
