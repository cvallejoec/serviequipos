import { UserBirthday } from '../../../../../src/contexts/iam/users/domain/value-objects/UserBirthday';
import { InvalidArgumentError } from '../../../../../src/common/domain/InvalidArgumentError';

describe('UserBirthday', () => {
  it('acepta una fecha de nacimiento válida en el pasado', () => {
    const date = new Date(Date.UTC(1990, 4, 20, 12, 0, 0));
    expect(new UserBirthday(date).value).toBe(date);
  });

  it('rechaza una fecha inválida (NaN)', () => {
    expect(() => new UserBirthday(new Date('no-es-fecha'))).toThrow(
      InvalidArgumentError,
    );
  });

  it('rechaza una fecha futura', () => {
    const future = new Date();
    future.setFullYear(future.getFullYear() + 1);
    expect(() => new UserBirthday(future)).toThrow(InvalidArgumentError);
  });

  it('rechaza una fecha de hace más de 120 años', () => {
    const now = new Date();
    const tooOld = new Date(
      now.getFullYear() - 121,
      now.getMonth(),
      now.getDate(),
    );
    expect(() => new UserBirthday(tooOld)).toThrow(InvalidArgumentError);
  });

  describe('fromString', () => {
    it('construye la fecha a mediodía UTC para no desplazar el día', () => {
      const birthday = UserBirthday.fromString('1990-05-20');
      expect(birthday.value.getUTCFullYear()).toBe(1990);
      expect(birthday.value.getUTCMonth()).toBe(4); // mayo = índice 4
      expect(birthday.value.getUTCDate()).toBe(20);
      expect(birthday.value.getUTCHours()).toBe(12);
    });

    it('propaga el error de dominio para una fecha futura', () => {
      const nextYear = new Date().getFullYear() + 1;
      expect(() => UserBirthday.fromString(`${nextYear}-01-01`)).toThrow(
        InvalidArgumentError,
      );
    });
  });
});
