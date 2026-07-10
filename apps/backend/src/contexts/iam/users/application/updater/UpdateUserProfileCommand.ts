export class UpdateUserProfileCommand {
  constructor(
    public readonly userId: string,
    public readonly firstName: string,
    public readonly lastName: string,
    public readonly phone: string,
    public readonly gender: string,
    public readonly birthday: string,
  ) {}
}
