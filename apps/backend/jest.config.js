const { base, swcTransform } = require('./test/jest.preset');

/**
 * Configuración de las pruebas UNITARIAS.
 *
 * Cubren dominio (value objects, agregados, eventos) y aplicación
 * (command/query handlers con repositorios y puertos mockeados). No tocan
 * base de datos, red ni el contenedor de Nest: son rápidas y deterministas.
 * Transpilan con SWC.
 *
 * Integración (`*.integration.spec.ts`) y e2e (`*.e2e-spec.ts`) tienen su
 * propia config bajo `test/` y se excluyen aquí.
 *
 * @type {import('jest').Config}
 */
module.exports = {
  ...base,
  rootDir: '.',
  roots: ['<rootDir>/src', '<rootDir>/test'],
  testRegex: '.*\\.spec\\.ts$',
  testPathIgnorePatterns: ['\\.e2e-spec\\.ts$', '\\.integration\\.spec\\.ts$'],
  transform: { '^.+\\.(t|j)s$': swcTransform },
  collectCoverageFrom: [
    'src/**/*.(t|j)s',
    // Excluimos lo que no aporta cobertura significativa: bootstrap,
    // módulos de wiring de Nest, DTOs, entidades de persistencia y barrels.
    '!src/main.ts',
    '!src/**/*.module.ts',
    '!src/**/index.ts',
    '!src/database/entities/**',
    '!src/api/**/dtos/**',
  ],
  coverageDirectory: './coverage',
  // SWC es liviano en RAM, así que podemos usar más núcleos. 50% deja
  // headroom para el resto del sistema.
  maxWorkers: '50%',
};
