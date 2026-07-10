// `class-validator`/`class-transformer` leen la metadata de decorador vía
// `Reflect.getMetadata`, que necesita el polyfill de `reflect-metadata`. En
// la app lo carga Nest; aquí lo importamos explícitamente antes que nada.
import 'reflect-metadata';
import {
  validate,
  Environment,
  LogLevel,
} from '../../src/config/env.validation';

describe('validate (env.validation)', () => {
  /**
   * Conjunto mínimo de variables requeridas (sin `@IsOptional`). Sin alguna
   * de ellas la validación debe fallar.
   */
  const requiredEnv = (): Record<string, unknown> => ({
    DB_HOST: 'localhost',
    DB_USERNAME: 'postgres',
    DB_PASSWORD: 'secret',
    DB_NAME: 'serviequipos',
    JWT_SECRET: 'super-secret',
    GOOGLE_CLIENT_ID: 'google-id',
    GOOGLE_CLIENT_SECRET: 'google-secret',
    GOOGLE_CALLBACK_URL: 'https://app/google/callback',
    MICROSOFT_CLIENT_ID: 'ms-id',
    MICROSOFT_CLIENT_SECRET: 'ms-secret',
    MICROSOFT_CALLBACK_URL: 'https://app/ms/callback',
    FRONTEND_URL: 'https://app',
  });

  it('pasa con todas las variables requeridas presentes', () => {
    expect(() => validate(requiredEnv())).not.toThrow();
  });

  it('aplica los defaults de las variables opcionales', () => {
    const validated = validate(requiredEnv());

    expect(validated.NODE_ENV).toBe(Environment.Development);
    expect(validated.PORT).toBe(8000);
    expect(validated.LOG_LEVEL).toBe(LogLevel.Log);
    expect(validated.DB_PORT).toBe(5432);
    expect(validated.JWT_EXPIRES_IN).toBe('7d');
  });

  it('convierte implícitamente los números pasados como string', () => {
    const validated = validate({ ...requiredEnv(), PORT: '3000' });

    expect(validated.PORT).toBe(3000);
  });

  it('respeta los valores provistos para las variables opcionales', () => {
    const validated = validate({
      ...requiredEnv(),
      NODE_ENV: 'production',
      LOG_LEVEL: 'debug',
    });

    expect(validated.NODE_ENV).toBe(Environment.Production);
    expect(validated.LOG_LEVEL).toBe(LogLevel.Debug);
  });

  it('lanza si falta una variable requerida (DB_HOST)', () => {
    const env = requiredEnv();
    delete env.DB_HOST;

    expect(() => validate(env)).toThrow(/Environment validation failed/);
  });

  it('lanza si falta JWT_SECRET', () => {
    const env = requiredEnv();
    delete env.JWT_SECRET;

    expect(() => validate(env)).toThrow(/Environment validation failed/);
  });

  it('lanza si NODE_ENV no es un valor del enum', () => {
    expect(() => validate({ ...requiredEnv(), NODE_ENV: 'staging' })).toThrow(
      /Environment validation failed/,
    );
  });

  it('lanza si PORT está fuera del rango permitido', () => {
    expect(() => validate({ ...requiredEnv(), PORT: '70000' })).toThrow(
      /Environment validation failed/,
    );
  });
});
