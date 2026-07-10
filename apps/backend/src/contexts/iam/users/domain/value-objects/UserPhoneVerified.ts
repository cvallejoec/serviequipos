import { BooleanValueObject } from '../../../../../common/domain';

export class UserPhoneVerified extends BooleanValueObject {
  static verified(): UserPhoneVerified {
    return new UserPhoneVerified(true);
  }

  static unverified(): UserPhoneVerified {
    return new UserPhoneVerified(false);
  }
}
