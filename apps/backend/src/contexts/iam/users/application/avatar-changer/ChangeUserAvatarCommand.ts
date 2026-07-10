/**
 * Command para subir/reemplazar la foto de avatar de un usuario. El
 * handler valida la imagen, la recorta a un cuadrado centrado y la
 * sube vía el puerto `FileStorage`.
 */
export class ChangeUserAvatarCommand {
  constructor(
    public readonly userId: string,
    public readonly originalContent: Buffer,
    public readonly mimeType: string,
  ) {}
}
