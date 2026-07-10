export class AuthenticateByOtpCommand {
  constructor(
    public readonly email: string,
    public readonly code: string,
  ) {}
}
