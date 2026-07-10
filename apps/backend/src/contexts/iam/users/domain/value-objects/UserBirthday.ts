import {
  InvalidArgumentError,
  ValueObject,
} from '../../../../../common/domain';

export class UserBirthday extends ValueObject<Date> {
  constructor(value: Date) {
    super(value);
    this.ensureIsValidDate(value);
  }

  private ensureIsValidDate(value: Date): void {
    if (isNaN(value.getTime())) {
      throw new InvalidArgumentError('La fecha de nacimiento no es válida');
    }
    const now = new Date();
    const minDate = new Date(
      now.getFullYear() - 120,
      now.getMonth(),
      now.getDate(),
    );
    if (value > now) {
      throw new InvalidArgumentError(
        'La fecha de nacimiento no puede ser futura',
      );
    }
    if (value < minDate) {
      throw new InvalidArgumentError('La fecha de nacimiento no es válida');
    }
  }

  static fromString(value: string): UserBirthday {
    const [year, month, day] = value.split('-').map(Number);
    // Mediodía UTC para que ningún offset horario desplace la fecha al día anterior/siguiente
    return new UserBirthday(new Date(Date.UTC(year, month - 1, day, 12, 0, 0)));
  }
}
