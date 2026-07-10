import { Global, Module } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';
import { DOMAIN_EVENT_DISPATCHER } from './DomainEventDispatcher';
import { InMemoryDomainEventDispatcher } from './InMemoryDomainEventDispatcher';

/**
 * Módulo global del despachador de eventos de dominio. Los handlers se
 * descubren automáticamente vía `DiscoveryService`: cada provider que
 * expone `subscribesTo: string` y `handle(event)` queda registrado.
 *
 * Patrón de uso en un handler de application:
 *   await this.repository.save(aggregate);
 *   await this.dispatcher.dispatch(aggregate.pullDomainEvents());
 */
@Global()
@Module({
  imports: [DiscoveryModule],
  providers: [
    {
      provide: DOMAIN_EVENT_DISPATCHER,
      useClass: InMemoryDomainEventDispatcher,
    },
  ],
  exports: [DOMAIN_EVENT_DISPATCHER],
})
export class DomainEventsModule {}
