import { EnumValueObject } from '../../../../../common/domain';

/**
 * Visibilidad del archivo dentro del bucket. `public` significa que el
 * objeto se sube con ACL pública y devuelve una URL directa accesible
 * sin firmar. `private` mantiene el objeto restringido y el acceso se
 * hace con URLs firmadas con expiración.
 */
export enum FileVisibilityEnum {
  PUBLIC = 'public',
  PRIVATE = 'private',
}

export class FileVisibility extends EnumValueObject<FileVisibilityEnum> {
  protected validValues(): FileVisibilityEnum[] {
    return Object.values(FileVisibilityEnum);
  }

  static public(): FileVisibility {
    return new FileVisibility(FileVisibilityEnum.PUBLIC);
  }

  static private(): FileVisibility {
    return new FileVisibility(FileVisibilityEnum.PRIVATE);
  }

  isPublic(): boolean {
    return this.value === FileVisibilityEnum.PUBLIC;
  }
}
