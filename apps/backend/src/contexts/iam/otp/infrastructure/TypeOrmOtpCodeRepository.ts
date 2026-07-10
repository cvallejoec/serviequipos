import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, MoreThan, Repository } from 'typeorm';
import { CLOCK, Clock } from '../../../../common/domain';
import { DbOtpCode } from '../../../../database/entities/DbOtpCode';
import { OtpCode } from '../domain/OtpCode';
import { OtpCodeRepository } from '../domain/OtpCodeRepository';
import { OtpCodeEmail } from '../domain/value-objects/OtpCodeEmail';
import { OtpCodeId } from '../domain/value-objects/OtpCodeId';
import { OtpCodeValue } from '../domain/value-objects/OtpCodeValue';
import { OtpCodeMapper } from './OtpCodeMapper';

@Injectable()
export class TypeOrmOtpCodeRepository implements OtpCodeRepository {
  constructor(
    @InjectRepository(DbOtpCode)
    private readonly repository: Repository<DbOtpCode>,
    @Inject(CLOCK)
    private readonly clock: Clock,
  ) {}

  async save(otp: OtpCode): Promise<void> {
    await this.repository.save(OtpCodeMapper.toPersistence(otp));
  }

  async findValidByEmailAndCode(
    email: OtpCodeEmail,
    code: OtpCodeValue,
  ): Promise<OtpCode | null> {
    const now = this.clock.now();
    const db = await this.repository.findOne({
      where: {
        email: email.value,
        code: code.value,
        // IsNull() genera `usedAt IS NULL`. Un `null` a secas TypeORM lo ignora,
        // lo que dejaría pasar códigos ya usados (reutilizables dentro del TTL).
        usedAt: IsNull(),
        expiresAt: MoreThan(now),
      },
    });
    return db ? OtpCodeMapper.toDomain(db) : null;
  }

  async markUsed(id: OtpCodeId): Promise<void> {
    await this.repository.update(id.value, { usedAt: this.clock.now() });
  }

  async countRecentByEmail(email: OtpCodeEmail, since: Date): Promise<number> {
    return this.repository.count({
      where: {
        email: email.value,
        createdAt: MoreThan(since),
      },
    });
  }
}
