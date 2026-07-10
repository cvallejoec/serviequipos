/**
 * Puerto de tiempo. El dominio y la aplicación nunca llaman a `new Date()`
 * directamente: piden la hora a un `Clock`. Así el tiempo deja de ser una
 * dependencia global oculta y los tests pueden congelarlo con un doble
 * (`FixedClock`), volviendo determinista todo lo temporal (expiraciones,
 * timestamps de agregados, ventanas de rate-limit).
 */
export const CLOCK = Symbol('CLOCK');

export interface Clock {
  now(): Date;
}
