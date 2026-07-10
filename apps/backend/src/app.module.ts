import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_PIPE } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { validate } from './config/env.validation';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { DomainEventsModule } from './common/application/domain-events.module';
import { ClockModule } from './common/application/clock.module';
import { DatabaseModule } from './database/database.module';
import { HealthModule } from './health/health.module';
import { ContextsModule } from './contexts/contexts.module';
import { ApiModule } from './api/api.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate,
    }),
    ThrottlerModule.forRoot([
      // Default: 100 req / 60s por IP. Endpoints sensibles pueden
      // definir sus propios `@Throttle(...)` más estrictos.
      { name: 'default', ttl: 60_000, limit: 100 },
    ]),
    DomainEventsModule,
    ClockModule,
    DatabaseModule,
    HealthModule,
    ContextsModule,
    ApiModule,
  ],
  providers: [
    {
      provide: APP_PIPE,
      useFactory: () =>
        new ValidationPipe({
          whitelist: true,
          transform: true,
          forbidNonWhitelisted: true,
        }),
    },
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
