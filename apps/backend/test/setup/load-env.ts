/**
 * Carga de variables de entorno para pruebas de integración y e2e.
 *
 * Prioridad (gana el primero que define cada variable, `override: false`):
 *   1. `.env.test.local` — secretos locales, gitignoreado.
 *   2. `.env.test`       — defaults de test compartidos (si se commitea).
 *   3. `.env`            — respaldo con la config de desarrollo.
 * Las variables ya presentes en el entorno del proceso (ej. CI) nunca se
 * sobrescriben.
 *
 * Solo lo usan las suites que tocan Postgres; las unitarias no cargan env.
 */
import { config as loadDotenv } from 'dotenv';
import { existsSync } from 'fs';
import { join } from 'path';
import { types } from 'pg';

// Mismo parser que `src/database/database.module.ts`: fuerza a interpretar los
// `timestamp` (OID 1114, sin zona) como UTC. Sin esto, el driver de pg los lee
// en la zona local del proceso y las comparaciones de fecha en integración/e2e
// se desplazan (ej. desde Ecuador, UTC-5). Las suites no importan
// `database.module`, así que replicamos el parser aquí.
types.setTypeParser(1114, (val: string) =>
  val === null ? null : new Date(val.replace(' ', 'T') + 'Z'),
);

const backendRoot = join(__dirname, '..', '..');

for (const file of ['.env.test.local', '.env.test', '.env']) {
  const path = join(backendRoot, file);
  if (existsSync(path)) {
    loadDotenv({ path, override: false, quiet: true });
  }
}

process.env.NODE_ENV = 'test';
