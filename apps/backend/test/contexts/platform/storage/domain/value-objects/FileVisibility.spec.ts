import {
  FileVisibility,
  FileVisibilityEnum,
} from '../../../../../../src/contexts/platform/storage/domain/value-objects/FileVisibility';
import { InvalidArgumentError } from '../../../../../../src/common/domain/InvalidArgumentError';

describe('FileVisibility', () => {
  it('acepta el valor "public" y expone su value', () => {
    const visibility = new FileVisibility(FileVisibilityEnum.PUBLIC);

    expect(visibility.value).toBe('public');
  });

  it('acepta el valor "private" y expone su value', () => {
    const visibility = new FileVisibility(FileVisibilityEnum.PRIVATE);

    expect(visibility.value).toBe('private');
  });

  it('lanza InvalidArgumentError con un valor inválido', () => {
    expect(() => new FileVisibility('invisible' as FileVisibilityEnum)).toThrow(
      InvalidArgumentError,
    );
  });

  it('el mensaje de error lista los valores permitidos', () => {
    expect(() => new FileVisibility('invisible' as FileVisibilityEnum)).toThrow(
      /public, private/,
    );
  });

  describe('factory public()', () => {
    it('construye una visibilidad pública', () => {
      const visibility = FileVisibility.public();

      expect(visibility.value).toBe(FileVisibilityEnum.PUBLIC);
      expect(visibility.isPublic()).toBe(true);
    });
  });

  describe('factory private()', () => {
    it('construye una visibilidad privada', () => {
      const visibility = FileVisibility.private();

      expect(visibility.value).toBe(FileVisibilityEnum.PRIVATE);
      expect(visibility.isPublic()).toBe(false);
    });
  });

  describe('isPublic()', () => {
    it('devuelve true solo cuando la visibilidad es pública', () => {
      expect(new FileVisibility(FileVisibilityEnum.PUBLIC).isPublic()).toBe(
        true,
      );
      expect(new FileVisibility(FileVisibilityEnum.PRIVATE).isPublic()).toBe(
        false,
      );
    });
  });
});
