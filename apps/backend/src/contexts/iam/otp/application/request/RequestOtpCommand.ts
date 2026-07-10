export class RequestOtpCommand {
  constructor(
    public readonly id: string,
    public readonly email: string,
  ) {}
}
