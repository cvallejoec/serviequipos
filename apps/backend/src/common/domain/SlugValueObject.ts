import { InvalidArgumentError } from './InvalidArgumentError';
import { StringValueObject } from './StringValueObject';

export class SlugValueObject extends StringValueObject {
  constructor(value: string) {
    super(value);
    this.ensureIsValid(value);
  }

  public static build(value: string): SlugValueObject {
    const slug = this.slugify(value);
    return new SlugValueObject(slug);
  }

  private static slugify(value: string): string {
    return value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .replace(/-+/g, '-');
  }

  public ensureIsValid(slug: string): void {
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    if (!slugRegex.test(slug)) {
      throw new InvalidArgumentError(`Slug <${slug}> no válido`);
    }
  }

  public toString(): string {
    return this.value;
  }
}
