import { plainToInstance } from 'class-transformer';
import {
  IsBooleanString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  validateSync,
} from 'class-validator';

export enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

export enum LogLevel {
  Error = 'error',
  Warn = 'warn',
  Log = 'log',
  Debug = 'debug',
  Verbose = 'verbose',
}

class EnvironmentVariables {
  @IsEnum(Environment)
  @IsOptional()
  NODE_ENV: Environment = Environment.Development;

  @IsNumber()
  @Min(1)
  @Max(65535)
  @IsOptional()
  PORT: number = 8000;

  @IsEnum(LogLevel)
  @IsOptional()
  LOG_LEVEL: LogLevel = LogLevel.Log;

  // ----- Base de datos (PostgreSQL) -----

  @IsString()
  DB_HOST: string;

  @IsNumber()
  @IsOptional()
  DB_PORT: number = 5432;

  @IsString()
  DB_USERNAME: string;

  @IsString()
  DB_PASSWORD: string;

  @IsString()
  DB_NAME: string;

  @IsOptional()
  @IsString()
  DB_SCHEMA?: string;

  // ----- Auth (JWT + OAuth) -----

  @IsString()
  JWT_SECRET: string;

  @IsString()
  @IsOptional()
  JWT_EXPIRES_IN: string = '7d';

  @IsString()
  GOOGLE_CLIENT_ID: string;

  @IsString()
  GOOGLE_CLIENT_SECRET: string;

  @IsString()
  GOOGLE_CALLBACK_URL: string;

  @IsString()
  MICROSOFT_CLIENT_ID: string;

  @IsString()
  MICROSOFT_CLIENT_SECRET: string;

  @IsString()
  MICROSOFT_CALLBACK_URL: string;

  /**
   * Tenant de Microsoft Entra. Default `common` (acepta cuentas de
   * organización y personales). Poner el Tenant ID solo si se quiere
   * restringir el login a una organización específica.
   */
  @IsOptional()
  @IsString()
  MICROSOFT_TENANT?: string;

  @IsString()
  FRONTEND_URL: string;

  // ----- Email (SendGrid) -----

  @IsOptional()
  @IsString()
  SENDGRID_API_KEY?: string;

  @IsOptional()
  @IsString()
  SENDGRID_FROM_EMAIL?: string;

  @IsOptional()
  @IsString()
  SENDGRID_FROM_NAME?: string;

  /**
   * Firewall de correo para entornos no productivos: cuando está
   * habilitado, redirige (o bloquea) los envíos para no escribir a
   * destinatarios reales durante desarrollo/QA.
   */
  @IsOptional()
  @IsBooleanString()
  EMAIL_FIREWALL_ENABLED?: string;

  @IsOptional()
  @IsString()
  EMAIL_FIREWALL_DEV_EMAIL?: string;

  @IsOptional()
  @IsString()
  EMAIL_FIREWALL_ALLOWED_EMAILS?: string;

  // ----- Storage / Digital Ocean Spaces (S3-compatible) -----

  /**
   * Endpoint regional del bucket de DO Spaces. Formato:
   * `https://<region>.digitaloceanspaces.com`.
   */
  @IsOptional()
  @IsString()
  DO_SPACES_ENDPOINT?: string;

  @IsOptional()
  @IsString()
  DO_SPACES_REGION?: string;

  @IsOptional()
  @IsString()
  DO_SPACES_BUCKET?: string;

  @IsOptional()
  @IsString()
  DO_SPACES_ACCESS_KEY?: string;

  @IsOptional()
  @IsString()
  DO_SPACES_SECRET_KEY?: string;

  /**
   * Base URL pública para archivos `public-read` (ej. un CDN). Si se
   * omite, se construye `https://<bucket>.<endpoint-host>`.
   */
  @IsOptional()
  @IsString()
  DO_SPACES_PUBLIC_URL?: string;
}

export function validate(config: Record<string, unknown>) {
  const validated = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validated, { skipMissingProperties: false });

  if (errors.length > 0) {
    throw new Error(`Environment validation failed:\n${errors.toString()}`);
  }

  return validated;
}
