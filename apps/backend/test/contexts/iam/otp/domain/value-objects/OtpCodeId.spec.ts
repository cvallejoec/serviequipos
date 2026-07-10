import { OtpCodeId } from '../../../../../../src/contexts/iam/otp/domain/value-objects/OtpCodeId';
import { InvalidArgumentError } from '../../../../../../src/common/domain/InvalidArgumentError';

describe('OtpCodeId', () => {
  it('acepta un CUID válido y expone su valor', () => {
    const raw = OtpCodeId.random().value;
    const id = new OtpCodeId(raw);
    expect(id.value).toBe(raw);
  });

  it('random genera un CUID con formato válido', () => {
    const id = OtpCodeId.random();
    expect(id.value).toMatch(/^c[a-z0-9]{24}$/);
  });

  // OtpCodeId extiende Id (Cuid): valida el formato del CUID.
  it('lanza InvalidArgumentError si el CUID no tiene formato válido', () => {
    expect(() => new OtpCodeId('no-es-un-cuid')).toThrow(InvalidArgumentError);
  });
});
