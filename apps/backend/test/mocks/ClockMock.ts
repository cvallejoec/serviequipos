import type { Clock } from '../../src/common/domain/Clock';

/**
 * Reloj fijo para tests: `now()` siempre devuelve la misma fecha. Congela el
 * tiempo para que todo lo temporal (timestamps de agregados, expiración de
 * OTP, ventanas de rate-limit) sea determinista y se pueda asertar el objeto
 * completo con `toEqual`.
 */
export class FixedClock implements Clock {
  constructor(
    private readonly fixedDate: Date = new Date('2026-01-15T10:00:00.000Z'),
  ) {}

  now(): Date {
    return this.fixedDate;
  }
}

/** Fecha por defecto que devuelve un `FixedClock` sin argumentos. */
export const FIXED_NOW = new Date('2026-01-15T10:00:00.000Z');
