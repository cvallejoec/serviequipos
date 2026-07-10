import { BooleanValueObject } from '../../../../../common/domain';

export class UserEmailVerified extends BooleanValueObject {
  static verified(): UserEmailVerified {
    return new UserEmailVerified(true);
  }

  static unverified(): UserEmailVerified {
    return new UserEmailVerified(false);
  }
}
