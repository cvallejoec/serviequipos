import { Injectable } from '@nestjs/common';
import type { DomainEvent } from '../../src/common/domain/DomainEvent';
import type { DomainEventDispatcher } from '../../src/common/application/DomainEventDispatcher';

/**
 * Dispatcher de eventos de dominio que no hace nada. Se usa en e2e para
 * evitar levantar el `DiscoveryService` y descubrir handlers reales.
 */
@Injectable()
export class NoOpDomainEventDispatcher implements DomainEventDispatcher {
  async dispatch(): Promise<void> {
    // no-op
  }
}

/**
 * Versión espiable para tests unitarios de handlers que despachan eventos:
 * permite aseverar `expect(dispatcher.dispatch).toHaveBeenCalledWith(...)`.
 */
export function createMockDomainEventDispatcher(): jest.Mocked<DomainEventDispatcher> {
  return {
    dispatch: jest.fn<Promise<void>, [DomainEvent[]]>(),
  };
}
