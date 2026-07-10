export class VerifyOtpQuery {
  constructor(
    public readonly email: string,
    public readonly code: string,
  ) {}
}
