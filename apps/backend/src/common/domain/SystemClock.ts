import { Clock } from './Clock';

/**
 * Implementación real del `Clock`: devuelve la hora del sistema. Es la que
 * se inyecta en producción vía el token `CLOCK`.
 */
export class SystemClock implements Clock {
  now(): Date {
    return new Date();
  }
}
