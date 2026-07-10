import { EnumValueObject } from '../../../../../common/domain';

export enum UserGenderEnum {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
  PREFER_NOT_TO_SAY = 'PREFER_NOT_TO_SAY',
}

export class UserGender extends EnumValueObject<UserGenderEnum> {
  protected validValues(): UserGenderEnum[] {
    return Object.values(UserGenderEnum);
  }
}
