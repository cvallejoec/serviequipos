import { DomainEvent } from '../domain/DomainEvent';

export const DOMAIN_EVENT_DISPATCHER = Symbol('DOMAIN_EVENT_DISPATCHER');

/**
 * Handler de un evento de dominio. Cualquier provider que cumpla este
 * shape (tiene `subscribesTo: string` y `handle(event)`) es descubierto
 * automáticamente por el dispatcher in-memory.
 *
 * `subscribesTo` debe coincidir con `event.eventName`. Un solo handler
 * por evento es lo común, pero el dispatcher admite varios suscriptores
 * al mismo eventName y los ejecuta en paralelo.
 */
export interface DomainEventHandler<E extends DomainEvent = DomainEvent> {
  readonly subscribesTo: string;
  handle(event: E): Promise<void>;
}

/**
 * Despacha eventos pulled de un agregado tras `repository.save(...)`.
 * Implementación in-memory por ahora (suficiente para MVP).
 * Cuando agreguemos outbox transaccional, esta interfaz no cambia.
 */
export interface DomainEventDispatcher {
  dispatch(events: DomainEvent[]): Promise<void>;
}
