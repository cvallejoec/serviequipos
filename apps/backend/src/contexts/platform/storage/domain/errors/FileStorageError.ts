import { HttpStatus } from '@nestjs/common';
import { DomainError } from '../../../../../common/domain';

/**
 * Error genérico para fallos del proveedor de almacenamiento de archivos
 * (upload, delete, generación de URLs firmadas, etc.). El `provider`
 * identifica el adaptador que falló — útil al cambiar de proveedor
 * para rastrear de dónde viene el problema.
 */
export class FileStorageError extends DomainError {
  readonly type = 'FILE_STORAGE_ERROR';
  readonly provider: string;

  constructor(provider: string, message: string) {
    super(`[${provider}] ${message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    this.provider = provider;
  }
}
