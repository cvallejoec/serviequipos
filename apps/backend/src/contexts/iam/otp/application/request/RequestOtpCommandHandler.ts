import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CLOCK, Clock } from '../../../../../common/domain';
import { OtpCode } from '../../domain/OtpCode';
import {
  OTP_CODE_REPOSITORY,
  OtpCodeRepository,
} from '../../domain/OtpCodeRepository';
import { OtpCodeId } from '../../domain/value-objects/OtpCodeId';
import { OtpCodeEmail } from '../../domain/value-objects/OtpCodeEmail';
import { OtpCodeValue } from '../../domain/value-objects/OtpCodeValue';
import { TooManyOtpRequests } from '../../domain/errors/TooManyOtpRequests';
import { EMAIL_SENDER, EmailSender } from '../../../shared/domain/EmailSender';
import { RequestOtpCommand } from './RequestOtpCommand';

const OTP_TTL_MINUTES = 10;
// Tope por email/hora como backstop anti-abuso (email-bombing). El front ya
// impone un cooldown de 60s entre reenvíos, así que este cap solo debe frenar
// scripts que lo salteen.
const MAX_OTPS_PER_HOUR = 10;

@Injectable()
export class RequestOtpCommandHandler {
  constructor(
    @Inject(OTP_CODE_REPOSITORY)
    private readonly otpRepository: OtpCodeRepository,
    @Inject(EMAIL_SENDER)
    private readonly emailSender: EmailSender,
    private readonly configService: ConfigService,
    @Inject(CLOCK)
    private readonly clock: Clock,
  ) {}

  async execute(command: RequestOtpCommand): Promise<void> {
    const email = new OtpCodeEmail(command.email);
    const oneHourAgo = new Date(this.clock.now().getTime() - 60 * 60 * 1000);
    const recentCount = await this.otpRepository.countRecentByEmail(
      email,
      oneHourAgo,
    );

    if (recentCount >= MAX_OTPS_PER_HOUR) {
      throw new TooManyOtpRequests();
    }

    const code = String(Math.floor(100000 + Math.random() * 900000)).padStart(
      6,
      '0',
    );

    const otp = OtpCode.create(
      {
        id: new OtpCodeId(OtpCodeId.random().value),
        email,
        code: new OtpCodeValue(code),
        ttlMinutes: OTP_TTL_MINUTES,
      },
      this.clock,
    );

    await this.otpRepository.save(otp);

    await this.emailSender.send({
      to: command.email,
      subject: 'Tu código de verificación',
      htmlBody: this.buildEmailHtml(code, command.email),
    });
  }

  private buildEmailHtml(code: string, email: string): string {
    const magicLinkButton = this.buildMagicLinkButton(email, code);

    return `
      <!DOCTYPE html>
      <html lang="es">
      <head><meta charset="UTF-8"></head>
      <body style="font-family: sans-serif; background: #faf7f0; padding: 32px; text-align: center;">
        <div style="max-width: 400px; margin: 0 auto; background: #fff; border-radius: 16px; padding: 40px; border: 1px solid #e5e0d5;">
          <h2 style="color: #1c1409; margin-bottom: 8px;">Código de verificación</h2>
          <p style="color: #6b5e4e; margin-bottom: 32px;">Ingresa este código para iniciar sesión:</p>
          <div style="background: #faf7f0; border-radius: 12px; padding: 24px; font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #c2603d; margin-bottom: 24px;">
            ${code}
          </div>
          ${magicLinkButton}
          <p style="color: #9c8f82; font-size: 14px;">Válido por ${OTP_TTL_MINUTES} minutos. Si no lo solicitaste, ignora este mensaje.</p>
        </div>
      </body>
      </html>
    `;
  }

  private buildMagicLinkButton(email: string, code: string): string {
    const frontendUrl = this.configService.getOrThrow<string>('FRONTEND_URL');
    const url = `${frontendUrl}/login/magic?email=${encodeURIComponent(email)}&code=${code}`;
    return `
      <p style="color: #6b5e4e; margin-bottom: 12px;">O da clic aquí para iniciar sesión:</p>
      <a href="${url}" style="display: inline-block; background: #c2603d; color: #fff; text-decoration: none; padding: 12px 24px; border-radius: 12px; font-size: 14px; font-weight: 600; margin-bottom: 24px;">
        Iniciar sesión
      </a>
      <p style="color: #9c8f82; font-size: 12px; margin-bottom: 24px;">Si el botón no funciona, copia y pega esta URL:<br/><span style="word-break: break-all;">${url}</span></p>
    `;
  }
}
