import { Inject, Injectable } from '@nestjs/common';
import {
  FILE_STORAGE,
  FileStorage,
  UploadedFile,
} from '../../domain/FileStorage';
import {
  FileVisibility,
  FileVisibilityEnum,
} from '../../domain/value-objects/FileVisibility';
import { UploadFileCommand } from './UploadFileCommand';

/**
 * Caso de uso para subir un archivo desde primitivos. Centraliza el
 * mapeo primitivo → value object para que los callers (controladores u
 * otros handlers) no tengan que conocer el dominio del módulo.
 *
 * Es solo un orquestador delgado: la lógica real vive en el adaptador
 * inyectado vía `FILE_STORAGE`.
 */
@Injectable()
export class UploadFileCommandHandler {
  constructor(
    @Inject(FILE_STORAGE)
    private readonly fileStorage: FileStorage,
  ) {}

  async execute(command: UploadFileCommand): Promise<UploadedFile> {
    const visibility = new FileVisibility(
      command.visibility as FileVisibilityEnum,
    );

    return this.fileStorage.upload({
      key: command.key,
      content: command.content,
      contentType: command.contentType,
      visibility,
      metadata: command.metadata ?? undefined,
    });
  }
}
