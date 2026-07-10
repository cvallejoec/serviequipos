import { TimestampValueObject } from '../../../src/common/domain/TimestampValueObject';
import { InvalidArgumentError } from '../../../src/common/domain/InvalidArgumentError';

describe('TimestampValueObject', () => {
  it('acepta una fecha válida', () => {
    const fecha = new Date('2026-07-13T00:00:00.000Z');
    expect(new TimestampValueObject(fecha).value).toBe(fecha);
  });

  it.each([null, undefined])('rechaza el valor %s', (invalid) => {
    expect(() => new TimestampValueObject(invalid as never)).toThrow(
      InvalidArgumentError,
    );
  });

  it('dos timestamps distintos no son iguales por referencia de valor', () => {
    const a = new TimestampValueObject(new Date('2026-01-01T00:00:00.000Z'));
    const b = new TimestampValueObject(new Date('2026-01-01T00:00:00.000Z'));
    // La comparación de ValueObject usa === , y dos Date distintas no lo son.
    expect(a.equals(b)).toBe(false);
  });
});
