import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { FileStorageError } from '../domain/errors/FileStorageError';
import { FileStorage, FileToUpload, UploadedFile } from '../domain/FileStorage';

const PROVIDER_NAME = 'DIGITAL_OCEAN_SPACES';

/**
 * Adaptador de `FileStorage` para Digital Ocean Spaces. Spaces expone
 * una API S3-compatible, por lo que usamos el cliente oficial de AWS
 * apuntado al endpoint regional de DO (ej. `https://nyc3.digitaloceanspaces.com`).
 *
 * Para URLs públicas se prefiere `DO_SPACES_PUBLIC_URL` cuando está
 * configurado (CDN/edge endpoint de DO). Si no, se construye una URL
 * directa al endpoint del bucket. Para archivos privados se devuelve
 * una URL firmada de corta duración.
 *
 * Para cambiar de proveedor (S3, R2, GCS, etc.), basta con escribir
 * un nuevo adaptador en este mismo directorio e intercambiar el binding
 * en `storage.module.ts`. El dominio no se toca.
 */
@Injectable()
export class DigitalOceanSpacesStorage implements FileStorage {
  private readonly logger = new Logger(DigitalOceanSpacesStorage.name);
  private readonly client: S3Client;
  private readonly bucket: string;
  private readonly publicBaseUrl: string;

  constructor(config: ConfigService) {
    const endpoint = config.get<string>('DO_SPACES_ENDPOINT');
    const region = config.get<string>('DO_SPACES_REGION');
    const bucket = config.get<string>('DO_SPACES_BUCKET');
    const accessKeyId = config.get<string>('DO_SPACES_ACCESS_KEY');
    const secretAccessKey = config.get<string>('DO_SPACES_SECRET_KEY');

    if (!endpoint || !region || !bucket || !accessKeyId || !secretAccessKey) {
      throw new FileStorageError(
        PROVIDER_NAME,
        'Faltan credenciales para Digital Ocean Spaces. Requeridos: DO_SPACES_ENDPOINT, DO_SPACES_REGION, DO_SPACES_BUCKET, DO_SPACES_ACCESS_KEY, DO_SPACES_SECRET_KEY',
      );
    }

    this.bucket = bucket;
    // Si no hay CDN configurado, se construye la URL pública directa al
    // bucket usando el subdominio virtual (`<bucket>.<endpoint-host>`).
    // `DO_SPACES_PUBLIC_URL` definida pero vacía (caso típico al copiar
    // .env.example) cuenta como "no configurada".
    const publicUrlRaw = config.get<string>('DO_SPACES_PUBLIC_URL')?.trim();
    this.publicBaseUrl = publicUrlRaw
      ? this.assertAbsoluteUrl('DO_SPACES_PUBLIC_URL', publicUrlRaw)
      : this.buildDefaultPublicBaseUrl(endpoint, bucket);

    this.client = new S3Client({
      endpoint,
      region,
      credentials: { accessKeyId, secretAccessKey },
      // DO Spaces no soporta el modo virtual-hosted con el endpoint
      // regional para todas las operaciones — `forcePathStyle: false`
      // funciona bien y es lo que recomienda DO en su guía S3-compat.
      forcePathStyle: false,
    });
  }

  async upload(file: FileToUpload): Promise<UploadedFile> {
    const key = this.normalizeKey(file.key);
    try {
      await this.client.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: key,
          Body: file.content,
          ContentType: file.contentType,
          ContentLength: file.content.length,
          ACL: file.visibility.isPublic() ? 'public-read' : 'private',
          Metadata: file.metadata,
        }),
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Fallo al subir <${key}>: ${message}`);
      throw new FileStorageError(
        PROVIDER_NAME,
        `No se pudo subir el archivo <${key}>: ${message}`,
      );
    }

    const url = file.visibility.isPublic()
      ? this.buildPublicUrl(key)
      : await this.getSignedUrl(key, 60 * 60);

    return {
      key,
      url,
      size: file.content.length,
      contentType: file.contentType,
    };
  }

  async delete(key: string): Promise<void> {
    const normalized = this.normalizeKey(key);
    try {
      await this.client.send(
        new DeleteObjectCommand({
          Bucket: this.bucket,
          Key: normalized,
        }),
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Fallo al eliminar <${normalized}>: ${message}`);
      throw new FileStorageError(
        PROVIDER_NAME,
        `No se pudo eliminar el archivo <${normalized}>: ${message}`,
      );
    }
  }

  async getSignedUrl(key: string, expiresInSeconds: number): Promise<string> {
    const normalized = this.normalizeKey(key);
    try {
      return await getSignedUrl(
        this.client,
        new GetObjectCommand({
          Bucket: this.bucket,
          Key: normalized,
        }),
        { expiresIn: expiresInSeconds },
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new FileStorageError(
        PROVIDER_NAME,
        `No se pudo generar la URL firmada para <${normalized}>: ${message}`,
      );
    }
  }

  /**
   * Remueve un slash inicial y colapsa cualquier `//` accidental para
   * tener una clave canónica. DO Spaces acepta slashes pero los trata
   * como parte del nombre del objeto — duplicarlos produce keys raros.
   */
  private normalizeKey(key: string): string {
    return key.replace(/^\/+/, '').replace(/\/{2,}/g, '/');
  }

  private buildPublicUrl(key: string): string {
    return `${this.publicBaseUrl.replace(/\/+$/, '')}/${encodeURI(key)}`;
  }

  private buildDefaultPublicBaseUrl(endpoint: string, bucket: string): string {
    // Endpoint llega como `https://nyc3.digitaloceanspaces.com`. La URL
    // virtual-hosted del bucket es `https://<bucket>.nyc3.digitaloceanspaces.com`.
    const url = new URL(this.assertAbsoluteUrl('DO_SPACES_ENDPOINT', endpoint));
    return `${url.protocol}//${bucket}.${url.host}`;
  }

  /**
   * Falla con un mensaje accionable si la URL viene sin protocolo. Sin
   * esto, el `BusinessLogoUrl` (que exige http(s)://) rechaza el upload
   * recién después de subir el objeto al bucket, dejando un huérfano.
   */
  private assertAbsoluteUrl(envVar: string, value: string): string {
    if (!/^https?:\/\//i.test(value)) {
      throw new FileStorageError(
        PROVIDER_NAME,
        `${envVar} debe incluir el protocolo (http:// o https://). Valor recibido: <${value}>`,
      );
    }
    return value;
  }
}
