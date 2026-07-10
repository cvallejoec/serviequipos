import { Module } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { DbUser } from '../src/database/entities/DbUser';
import { DbOtpCode } from '../src/database/entities/DbOtpCode';

/**
 * Todas las entidades de persistencia que participan en las pruebas de
 * integración/e2e. Al agregar una nueva entidad al proyecto, súmala aquí
 * (y a `tableCleanupOrder` de abajo).
 */
export const testEntities = [DbUser, DbOtpCode];

/**
 * Configuración de TypeORM para pruebas contra una base Postgres REAL,
 * dedicada a tests. Lee credenciales de `TEST_DB_*` (cargadas por
 * `test/setup/load-env.ts`), con fallback a valores locales.
 *
 * `synchronize: true` recrea el esquema desde las entidades en cada corrida,
 * así los tests no dependen de migraciones. Apúntalo SIEMPRE a una base
 * desechable: `dropSchema`/`DELETE` borran datos.
 */
export const testDatabaseConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.TEST_DB_HOST || 'localhost',
  port: parseInt(process.env.TEST_DB_PORT || '5432', 10),
  username: process.env.TEST_DB_USERNAME || 'postgres',
  password: process.env.TEST_DB_PASSWORD || 'postgres',
  database: process.env.TEST_DB_NAME || 'serviequipos_test',
  schema: process.env.TEST_DB_SCHEMA || 'public',
  entities: testEntities,
  synchronize: true,
  dropSchema: false,
  logging: false,
};

/**
 * Orden de borrado de tablas respetando foreign keys (hijos antes que
 * padres). Hoy ninguna entidad referencia a otra, pero mantenemos el orden
 * explícito para cuando aparezcan relaciones.
 */
const tableCleanupOrder = ['otp_codes', 'users'];

/**
 * Vacía todas las tablas conocidas. Llámalo en `beforeEach` de las suites
 * de integración/e2e para aislar cada test.
 */
export async function cleanDatabase(dataSource: DataSource): Promise<void> {
  for (const tableName of tableCleanupOrder) {
    const entity = dataSource.entityMetadatas.find(
      (meta) => meta.tableName === tableName,
    );
    if (entity) {
      await dataSource
        .getRepository(entity.name)
        .query(`DELETE FROM "${tableName}"`);
    }
  }
}

/**
 * Módulo mínimo que solo levanta la conexión a la base de test. Útil para
 * suites de integración que además necesitan `TypeOrmModule.forFeature([...])`.
 */
@Module({
  imports: [TypeOrmModule.forRoot(testDatabaseConfig)],
  exports: [TypeOrmModule],
})
export class TestDatabaseModule {}
