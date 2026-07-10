import { Inject, Injectable } from '@nestjs/common';
import {
  OTP_CODE_REPOSITORY,
  OtpCodeRepository,
} from '../../domain/OtpCodeRepository';
import { OtpCodeEmail } from '../../domain/value-objects/OtpCodeEmail';
import { OtpCodeId } from '../../domain/value-objects/OtpCodeId';
import { OtpCodeValue } from '../../domain/value-objects/OtpCodeValue';
import { InvalidOtpCode } from '../../domain/errors/InvalidOtpCode';
import { VerifyOtpQuery } from './VerifyOtpQuery';

@Injectable()
export class VerifyOtpQueryHandler {
  constructor(
    @Inject(OTP_CODE_REPOSITORY)
    private readonly otpRepository: OtpCodeRepository,
  ) {}

  async execute(query: VerifyOtpQuery): Promise<void> {
    const email = new OtpCodeEmail(query.email);
    const code = new OtpCodeValue(query.code);

    const otp = await this.otpRepository.findValidByEmailAndCode(email, code);
    if (!otp) {
      throw new InvalidOtpCode();
    }

    const primitives = otp.toPrimitives();
    await this.otpRepository.markUsed(new OtpCodeId(primitives.id));
  }
}
