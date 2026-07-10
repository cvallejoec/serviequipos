// Importamos el locale `en` directamente (no el índice, que arrastra TODOS
// los locales). Menos archivos que transpilar => tests más rápidos.
import { faker } from '@faker-js/faker/locale/en';
import { Cuid } from '../../src/common/domain/Cuid';
import { Maybe } from '../../src/common/domain/Maybe';
import {
  OtpCode,
  OtpCodePrimitives,
} from '../../src/contexts/iam/otp/domain/OtpCode';

/**
 * Object mother para `OtpCode`. Genera un código OTP válido con datos aleatorios
 * (faker) y expone `with*` encadenables para fijar lo que el test necesita.
 *
 * Construye vía `OtpCode.fromPrimitives`, así permite estados arbitrarios
 * (usado, expirado, etc.) que la factory `OtpCode.create` no cubre.
 */
export class OtpCodeBuilder {
  private id: string = Cuid.random().value;
  private email = faker.internet.email().toLowerCase();
  private code = faker.string.numeric(6);
  private expiresAt: Date = new Date('2026-01-01T00:10:00.000Z');
  private usedAt: Date | null = null;
  private createdAt: Date = new Date('2026-01-01T00:00:00.000Z');

  static anOtpCode(): OtpCodeBuilder {
    return new OtpCodeBuilder();
  }

  withId(id: string): this {
    this.id = id;
    return this;
  }

  withEmail(email: string): this {
    this.email = email.toLowerCase();
    return this;
  }

  withCode(code: string): this {
    this.code = code;
    return this;
  }

  withExpiresAt(expiresAt: Date): this {
    this.expiresAt = expiresAt;
    return this;
  }

  withUsedAt(usedAt: Date | null): this {
    this.usedAt = usedAt;
    return this;
  }

  withCreatedAt(createdAt: Date): this {
    this.createdAt = createdAt;
    return this;
  }

  buildPrimitives(): OtpCodePrimitives {
    return {
      id: this.id,
      email: this.email,
      code: this.code,
      expiresAt: this.expiresAt,
      usedAt: Maybe.fromValue(this.usedAt),
      createdAt: this.createdAt,
    };
  }

  build(): OtpCode {
    return OtpCode.fromPrimitives(this.buildPrimitives());
  }
}
