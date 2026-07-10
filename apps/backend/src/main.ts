import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { Logger, LogLevel } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const isProduction = process.env.NODE_ENV === 'production';

  const logLevels: LogLevel[] = isProduction
    ? ['error', 'warn', 'log']
    : (['error', 'warn', 'log', 'debug', 'verbose'] as LogLevel[]);

  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
    logger: logLevels,
  });

  const config = app.get(ConfigService);
  const port = config.get<number>('PORT', 8000);
  const logLevel = config.get<string>('LOG_LEVEL', 'log');

  // Ajuste fino del nivel de log desde .env
  const levelMap: Record<string, LogLevel[]> = {
    error: ['error'],
    warn: ['error', 'warn'],
    log: ['error', 'warn', 'log'],
    debug: ['error', 'warn', 'log', 'debug'],
    verbose: ['error', 'warn', 'log', 'debug', 'verbose'],
  };

  app.useLogger(levelMap[logLevel] ?? logLevels);

  app.enableCors({ origin: '*' });
  app.enableShutdownHooks();

  await app.listen(port);

  const logger = new Logger('Bootstrap');
  logger.log(`Application running on port ${port}`);
  logger.log(`Environment: ${config.get('NODE_ENV', 'development')}`);
  logger.log(`Log level: ${logLevel}`);
}

void bootstrap();
