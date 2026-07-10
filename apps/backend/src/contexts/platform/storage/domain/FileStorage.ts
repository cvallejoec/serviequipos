import { FileVisibility } from './value-objects/FileVisibility';

export const FILE_STORAGE = Symbol('FILE_STORAGE');

/**
 * Payload de subida. El `key` es la ruta lógica dentro del bucket
 * (ej. `users/{userId}/avatar.png`). El caller decide la
 * estructura de carpetas — el puerto no asume nada sobre nombres.
 */
export interface FileToUpload {
  key: string;
  content: Buffer;
  contentType: string;
  visibility: FileVisibility;
  /**
   * Metadata opcional asociada al objeto. Los proveedores S3-compatibles
   * la persisten como `x-amz-meta-*`. Solo strings — no anidar objetos.
   */
  metadata?: Record<string, string>;
}

/**
 * Resultado de una subida exitosa. `url` es directamente accesible para
 * archivos públicos, o una URL firmada de corta duración para privados.
 * El caller que necesite renovar la URL firmada vuelve a llamar a
 * `getSignedUrl`.
 */
export interface UploadedFile {
  key: string;
  url: string;
  size: number;
  contentType: string;
}

/**
 * Puerto de almacenamiento de archivos. Cualquier contexto que necesite
 * persistir o servir archivos depende de esta abstracción, nunca del
 * proveedor concreto. Cambiar de Digital Ocean Spaces a S3, R2, GCS,
 * etc. se reduce a escribir un nuevo adaptador en `infrastructure/`.
 */
export interface FileStorage {
  /**
   * Sube el archivo al bucket. Si ya existe un objeto con el mismo
   * `key`, se reemplaza. Devuelve la URL para acceder al objeto.
   */
  upload(file: FileToUpload): Promise<UploadedFile>;

  /**
   * Elimina el objeto. Es idempotente — borrar un `key` inexistente
   * no debe lanzar error.
   */
  delete(key: string): Promise<void>;

  /**
   * Genera una URL firmada de lectura con expiración. Útil para
   * servir archivos privados sin exponerlos públicamente.
   */
  getSignedUrl(key: string, expiresInSeconds: number): Promise<string>;
}
