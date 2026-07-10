/**
 * Piezas compartidas por las tres suites (unit, integración, e2e).
 *
 * Las tres transpilan con **SWC**, la misma cadena que el build de producción
 * (`nest build -b swc`), para que los tests ejerciten exactamente lo que corre
 * en runtime. SWC emite metadata de decorador `Object` para tipos union
 * `X | null`, por lo que las entidades TypeORM declaran `type` explícito en
 * esas columnas (ver `database/entities/`) y no dependen de la metadata
 * reflejada.
 *
 * `transformIgnorePatterns` ignora `node_modules` EXCEPTO rutas con
 * `@faker-js` — faker v10 es ESM puro y hay que transpilarlo a CommonJS. El
 * patrón contempla la estructura de pnpm (`.pnpm/@faker-js+faker@x/...`).
 */
const swcTransform = [
  '@swc/jest',
  {
    swcrc: false,
    jsc: {
      target: 'es2021',
      parser: { syntax: 'typescript', decorators: true, dynamicImport: true },
      transform: {
        legacyDecorator: true,
        decoratorMetadata: true,
        useDefineForClassFields: false,
      },
      keepClassNames: true,
    },
  },
];

/** Config común: extensiones, entorno y el patrón que des-ignora faker. */
const base = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  testEnvironment: 'node',
  transformIgnorePatterns: ['/node_modules/(?!.*@faker-js)'],
};

module.exports = { base, swcTransform };
