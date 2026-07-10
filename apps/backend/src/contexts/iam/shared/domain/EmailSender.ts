export const EMAIL_SENDER = Symbol('EMAIL_SENDER');

export interface EmailSender {
  send(params: {
    to: string;
    subject: string;
    htmlBody: string;
  }): Promise<void>;
}
