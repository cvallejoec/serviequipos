import { Inject, Injectable, Logger } from '@nestjs/common';
import sharp from 'sharp';
import { CLOCK, Clock, Id } from '../../../../../common/domain';
import {
  FILE_STORAGE,
  FileStorage,
} from '../../../../platform/storage/domain/FileStorage';
import { FileVisibility } from '../../../../platform/storage/domain/value-objects/FileVisibility';
import { User } from '../../domain/User';
import { UserNotFound } from '../../domain/errors/UserNotFound';
import { UserAvatarInvalid } from '../../domain/errors/UserAvatarInvalid';
import { USER_REPOSITORY, UserRepository } from '../../domain/UserRepository';
import { UserAvatar } from '../../domain/value-objects/UserAvatar';
import { UserId } from '../../domain/value-objects/UserId';
import { ChangeUserAvatarCommand } from './ChangeUserAvatarCommand';

const ACCEPTED_MIME_TYPES = new Set([
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
]);
const MAX_BYTES = 5 * 1024 * 1024;
const OUTPUT_DIMENSION = 256;
const OUTPUT_FORMAT = 'webp' as const;
const OUTPUT_QUALITY = 82;

@Injectable()
export class ChangeUserAvatarCommandHandler {
  private readonly logger = new Logger(ChangeUserAvatarCommandHandler.name);

  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    @Inject(FILE_STORAGE)
    private readonly fileStorage: FileStorage,
    @Inject(CLOCK)
    private readonly clock: Clock,
  ) {}

  async execute(command: ChangeUserAvatarCommand): Promise<User> {
    this.assertAcceptedMimeType(command.mimeType);
    this.assertSizeUnderLimit(command.originalContent.length);

    const user = await this.userRepository.findById(new UserId(command.userId));
    if (!user) throw new UserNotFound(command.userId);

    const processed = await this.processImage(command.originalContent);
    const key = this.buildKey();
    const uploaded = await this.fileStorage.upload({
      key,
      content: processed,
      contentType: 'image/webp',
      visibility: FileVisibility.public(),
    });

    const previous = user.changeAvatar(
      new UserAvatar(uploaded.url),
      this.clock,
    );
    await this.userRepository.save(user);

    await this.tryDeletePrevious(previous);

    return user;
  }

  private assertAcceptedMimeType(mimeType: string): void {
    if (!ACCEPTED_MIME_TYPES.has(mimeType.toLowerCase())) {
      throw new UserAvatarInvalid(
        'Formato de imagen no soportado. Usa PNG, JPEG o WebP.',
      );
    }
  }

  private assertSizeUnderLimit(bytes: number): void {
    if (bytes > MAX_BYTES) {
      throw new UserAvatarInvalid(
        `La imagen supera el tamaño máximo permitido (${Math.round(MAX_BYTES / 1024 / 1024)} MB).`,
      );
    }
    if (bytes === 0) {
      throw new UserAvatarInvalid('El archivo está vacío.');
    }
  }

  private async processImage(input: Buffer): Promise<Buffer> {
    let pipeline: sharp.Sharp;
    try {
      pipeline = sharp(input, { failOn: 'error' });
      await pipeline.metadata();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new UserAvatarInvalid(`No pudimos procesar la imagen: ${message}`);
    }

    try {
      // El avatar siempre se muestra circular o cuadrado, así que recortamos
      // a un cuadrado centrado (`fit: 'cover'`) y reducimos a un tamaño
      // razonable para una foto de perfil. `rotate()` aplica EXIF antes de
      // descartarla. La salida es WebP para mantener un peso reducido.
      return await pipeline
        .rotate()
        .resize({
          width: OUTPUT_DIMENSION,
          height: OUTPUT_DIMENSION,
          fit: 'cover',
          position: 'attention',
          withoutEnlargement: false,
        })
        .webp({ quality: OUTPUT_QUALITY })
        .toBuffer();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Fallo procesando avatar: ${message}`);
      throw new UserAvatarInvalid(
        'No pudimos procesar la imagen. Intenta con otro archivo.',
      );
    }
  }

  /**
   * Carpeta plana `avatars/` con un ID aleatorio por subida. No exponemos
   * el ID del usuario en la URL pública, y el ID único por subida evita
   * que dos usuarios con la misma imagen choquen al borrarse el avatar
   * anterior. El cache busting lo da el ID nuevo en cada cambio.
   */
  private buildKey(): string {
    return `avatars/${Id.random().value}.${OUTPUT_FORMAT}`;
  }

  private async tryDeletePrevious(
    previous: ReturnType<User['changeAvatar']>,
  ): Promise<void> {
    if (previous.isEmpty()) return;
    const value = previous.get().value;
    const key = this.extractKeyFromUrl(value);
    // Solo borramos imágenes que estén bajo nuestro propio bucket
    // (las URLs de Google/ui-avatars no son nuestras y no se tocan).
    if (!key) return;
    try {
      await this.fileStorage.delete(key);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.warn(
        `No se pudo borrar el avatar anterior <${key}>: ${message}`,
      );
    }
  }

  private extractKeyFromUrl(url: string): string | null {
    const match = url.match(/avatars\/[^/?#]+/);
    return match ? match[0] : null;
  }
}
