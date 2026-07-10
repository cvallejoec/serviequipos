import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserStatusEnum } from '../../contexts/iam/users/domain/value-objects/UserStatus';
import { UserGenderEnum } from '../../contexts/iam/users/domain/value-objects/UserGender';

@Entity('users')
export class DbUser {
  @PrimaryColumn({ type: 'varchar', length: 32 })
  id: string;

  @Column({ name: 'first_name', length: 100 })
  firstName: string;

  @Column({ name: 'last_name', length: 100 })
  lastName: string;

  @Column({ unique: true, length: 255 })
  email: string;

  @Column({
    type: 'enum',
    enum: UserStatusEnum,
    default: UserStatusEnum.ACTIVE,
  })
  status: UserStatusEnum;

  @Column({ type: 'varchar', nullable: true, length: 500 })
  avatar: string | null;

  @Column({ type: 'varchar', nullable: true, length: 20, default: null })
  phone: string | null;

  @Column({
    type: 'enum',
    enum: UserGenderEnum,
    nullable: true,
    default: null,
  })
  gender: UserGenderEnum | null;

  @Column({
    type: 'date',
    nullable: true,
    default: null,
    transformer: {
      to: (value: Date | null) => value,
      from: (value: string | null) =>
        value ? new Date(value + 'T12:00:00Z') : null,
    },
  })
  birthday: Date | null;

  @Column({ name: 'email_verified', type: 'boolean', default: false })
  emailVerified: boolean;

  @Column({ name: 'phone_verified', type: 'boolean', default: false })
  phoneVerified: boolean;

  @Column({ name: 'profile_completed', type: 'boolean', default: false })
  profileCompleted: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
