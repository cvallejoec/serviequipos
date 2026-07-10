import { join } from 'path';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { types } from 'pg';

// OID 1114 = TIMESTAMP WITHOUT TIME ZONE. Por defecto el driver de pg lo
// parsea como hora local del proceso de Node, lo cual desplaza la marca de
// tiempo cuando el proceso corre en una zona distinta a UTC (el caso típico
// en desarrollo desde Ecuador). Forzamos la interpretación como UTC para que
// el round-trip con Postgres — que ya almacena en UTC — sea consistente.
types.setTypeParser(1114, (val: string) =>
  val === null ? null : new Date(val.replace(' ', 'T') + 'Z'),
);

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const isProduction = config.get<string>('NODE_ENV') === 'production';

        return {
          type: 'postgres',
          host: config.get<string>('DB_HOST'),
          port: config.get<number>('DB_PORT', 5432),
          username: config.get<string>('DB_USERNAME'),
          password: config.get<string>('DB_PASSWORD'),
          database: config.get<string>('DB_NAME'),
          schema: config.get<string>('DB_SCHEMA', 'public'),
          entities: [join(__dirname, 'entities', '**', '*.{ts,js}')],
          // synchronize: !isProduction,
          synchronize: true,
          // logging: !isProduction,
          logging: false,
          ssl: isProduction ? { rejectUnauthorized: false } : false,
          extra: {
            connectionTimeoutMillis: 10_000,
            query_timeout: 30_000,
            idleTimeoutMillis: 30_000,
            max: isProduction ? 20 : 5,
          },
        };
      },
    }),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
