import { EnumValueObject } from '../../../../../common/domain';

export enum UserStatusEnum {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export class UserStatus extends EnumValueObject<UserStatusEnum> {
  protected validValues(): UserStatusEnum[] {
    return Object.values(UserStatusEnum);
  }

  static active(): UserStatus {
    return new UserStatus(UserStatusEnum.ACTIVE);
  }

  static inactive(): UserStatus {
    return new UserStatus(UserStatusEnum.INACTIVE);
  }

  isActive(): boolean {
    return this.value === UserStatusEnum.ACTIVE;
  }
}
