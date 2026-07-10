import { Cuid } from './Cuid';

export class Id extends Cuid {
  public static override random(): Id {
    return new Id(Cuid.random().value);
  }
}
