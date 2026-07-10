import { Maybe } from '../../../../common/domain';
import { DbOtpCode } from '../../../../database/entities/DbOtpCode';
import { OtpCode } from '../domain/OtpCode';

export class OtpCodeMapper {
  static toDomain(db: DbOtpCode): OtpCode {
    return OtpCode.fromPrimitives({
      id: db.id,
      email: db.email,
      code: db.code,
      expiresAt: db.expiresAt,
      usedAt: Maybe.fromValue(db.usedAt),
      createdAt: db.createdAt,
    });
  }

  static toPersistence(otp: OtpCode): DbOtpCode {
    const p = otp.toPrimitives();
    const db = new DbOtpCode();
    db.id = p.id;
    db.email = p.email;
    db.code = p.code;
    db.expiresAt = p.expiresAt;
    db.usedAt = p.usedAt.toPrimitive() ?? null;
    return db;
  }
}
