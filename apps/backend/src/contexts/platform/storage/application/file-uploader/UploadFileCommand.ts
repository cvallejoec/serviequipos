/**
 * Command para subir un archivo a través del puerto `FileStorage`.
 * El handler convierte estos primitivos a value objects y delega en
 * el adaptador inyectado.
 */
export class UploadFileCommand {
  constructor(
    public readonly key: string,
    public readonly content: Buffer,
    public readonly contentType: string,
    public readonly visibility: 'public' | 'private',
    public readonly metadata: Record<string, string> | null,
  ) {}
}
