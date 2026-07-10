import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import sgMail from '@sendgrid/mail';
import { EmailSender } from '../domain/EmailSender';

interface EmailFirewallConfig {
  enabled: boolean;
  allowedEmails: string[];
  developmentEmail?: string;
}

@Injectable()
export class SendGridEmailSender implements EmailSender {
  private readonly logger = new Logger(SendGridEmailSender.name);
  private readonly firewallConfig: EmailFirewallConfig;

  constructor(private readonly config: ConfigService) {
    sgMail.setApiKey(config.getOrThrow<string>('SENDGRID_API_KEY'));

    const allowedEmails = config.get<string>('EMAIL_FIREWALL_ALLOWED_EMAILS');
    this.firewallConfig = {
      enabled: config.get<string>('EMAIL_FIREWALL_ENABLED') === 'true',
      allowedEmails: allowedEmails
        ? allowedEmails.split(',').map((email) => email.trim())
        : [],
      developmentEmail: config.get<string>('EMAIL_FIREWALL_DEV_EMAIL'),
    };

    this.logger.debug({
      message: 'Email firewall configurado',
      enabled: this.firewallConfig.enabled,
      allowedEmailsCount: this.firewallConfig.allowedEmails.length,
      hasDevelopmentEmail: !!this.firewallConfig.developmentEmail,
      environment: config.get<string>('NODE_ENV'),
    });
  }

  async send(params: {
    to: string;
    subject: string;
    htmlBody: string;
  }): Promise<void> {
    const finalRecipient = this.applyEmailFirewall(params.to);

    if (!finalRecipient) {
      this.logger.debug(`Email bloqueado por firewall: ${params.to}`);
      return;
    }

    const fromEmail = this.config.getOrThrow<string>('SENDGRID_FROM_EMAIL');
    const fromName =
      this.config.get<string>('SENDGRID_FROM_NAME') ?? 'serviequipos';
    const isRedirected = finalRecipient !== params.to;
    const htmlBody = isRedirected
      ? this.wrapWithRedirectBanner(params.htmlBody, params.to)
      : params.htmlBody;

    await sgMail.send({
      to: finalRecipient,
      from: { email: fromEmail, name: fromName },
      subject: params.subject,
      html: htmlBody,
    });

    if (isRedirected) {
      this.logger.debug(
        `Email redirigido por firewall: ${params.to} → ${finalRecipient}`,
      );
    }
  }

  private applyEmailFirewall(originalEmail: string): string | null {
    if (!this.firewallConfig.enabled) {
      return originalEmail;
    }

    if (this.isAllowed(originalEmail)) {
      return originalEmail;
    }

    const isDevelopment = this.config.get<string>('NODE_ENV') === 'development';
    if (isDevelopment && this.firewallConfig.developmentEmail) {
      return this.firewallConfig.developmentEmail;
    }

    return null;
  }

  private isAllowed(originalEmail: string): boolean {
    if (this.firewallConfig.allowedEmails.length === 0) {
      return false;
    }
    return this.firewallConfig.allowedEmails.some((allowedEmail) => {
      if (allowedEmail.startsWith('*@')) {
        const domain = allowedEmail.substring(2);
        return originalEmail.toLowerCase().endsWith('@' + domain.toLowerCase());
      }
      return originalEmail.toLowerCase() === allowedEmail.toLowerCase();
    });
  }

  private wrapWithRedirectBanner(
    htmlBody: string,
    originalEmail: string,
  ): string {
    const banner = `
      <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 12px; margin: 0 0 16px 0; border-radius: 6px; font-family: sans-serif; color: #856404;">
        <p style="margin: 0;"><strong>⚠️ Email de desarrollo:</strong> Este mensaje era para <code>${originalEmail}</code> pero fue redirigido aquí por el firewall de emails.</p>
      </div>
    `;
    if (/<body[^>]*>/i.test(htmlBody)) {
      return htmlBody.replace(/(<body[^>]*>)/i, `$1${banner}`);
    }
    return banner + htmlBody;
  }
}
