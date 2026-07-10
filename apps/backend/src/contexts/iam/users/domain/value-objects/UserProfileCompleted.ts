import { BooleanValueObject } from '../../../../../common/domain';

export class UserProfileCompleted extends BooleanValueObject {
  static completed(): UserProfileCompleted {
    return new UserProfileCompleted(true);
  }

  static incomplete(): UserProfileCompleted {
    return new UserProfileCompleted(false);
  }
}
