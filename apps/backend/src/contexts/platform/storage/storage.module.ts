import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UploadFileCommandHandler } from './application/file-uploader/UploadFileCommandHandler';
import { FILE_STORAGE, FileStorage } from './domain/FileStorage';
import { DigitalOceanSpacesStorage } from './infrastructure/DigitalOceanSpacesStorage';

/**
 * Módulo global de almacenamiento de archivos. Expone el puerto
 * `FILE_STORAGE` para que cualquier contexto pueda subir/eliminar
 * archivos sin acoplarse al proveedor concreto.
 *
 * Es `@Global` para evitar que cada módulo tenga que importarlo
 * explícitamente.
 *
 * Para cambiar de proveedor (S3, R2, GCS…), agrega el adaptador en
 * `infrastructure/` y reemplaza el binding del factory de abajo. El
 * resto del backend no se entera.
 */
@Global()
@Module({
  providers: [
    {
      provide: FILE_STORAGE,
      inject: [ConfigService],
      useFactory: (config: ConfigService): FileStorage => {
        return new DigitalOceanSpacesStorage(config);
      },
    },
    UploadFileCommandHandler,
  ],
  exports: [FILE_STORAGE, UploadFileCommandHandler],
})
export class StorageModule {}
