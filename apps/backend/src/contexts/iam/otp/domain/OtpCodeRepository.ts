import { OtpCode } from './OtpCode';
import { OtpCodeEmail } from './value-objects/OtpCodeEmail';
import { OtpCodeId } from './value-objects/OtpCodeId';
import { OtpCodeValue } from './value-objects/OtpCodeValue';

export const OTP_CODE_REPOSITORY = Symbol('OTP_CODE_REPOSITORY');

export interface OtpCodeRepository {
  save(otp: OtpCode): Promise<void>;
  findValidByEmailAndCode(
    email: OtpCodeEmail,
    code: OtpCodeValue,
  ): Promise<OtpCode | null>;
  markUsed(id: OtpCodeId): Promise<void>;
  countRecentByEmail(email: OtpCodeEmail, since: Date): Promise<number>;
}
