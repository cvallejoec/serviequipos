import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DiscoveryService } from '@nestjs/core';
import { DomainEvent } from '../domain/DomainEvent';
import {
  DomainEventDispatcher,
  DomainEventHandler,
} from './DomainEventDispatcher';

/**
 * Dispatch síncrono in-process. No transaccional con la persistencia:
 * si el save fue exitoso pero un handler falla, se loggea el error y
 * los demás handlers siguen ejecutándose. Para trabajo pesado, los
 * handlers deberían delegar a un job en background en lugar de hacerlo
 * inline.
 *
 * Descubre handlers vía `DiscoveryService`: cualquier provider que tenga
 * `subscribesTo: string` y `handle(event)` queda registrado automáticamente.
 * Cada handler debe estar declarado como provider en algún módulo.
 */
@Injectable()
export class InMemoryDomainEventDispatcher
  implements DomainEventDispatcher, OnModuleInit
{
  private readonly logger = new Logger(InMemoryDomainEventDispatcher.name);
  private readonly handlersByEventName = new Map<
    string,
    DomainEventHandler[]
  >();

  constructor(private readonly discoveryService: DiscoveryService) {}

  onModuleInit(): void {
    const providers = this.discoveryService.getProviders();
    for (const wrapper of providers) {
      const instance = wrapper.instance as unknown;
      if (!this.isHandler(instance)) continue;
      const existing =
        this.handlersByEventName.get(instance.subscribesTo) ?? [];
      existing.push(instance);
      this.handlersByEventName.set(instance.subscribesTo, existing);
    }

    this.logger.log(
      `Domain event handlers registrados: ${this.handlersByEventName.size} eventos cubiertos`,
    );
  }

  async dispatch(events: DomainEvent[]): Promise<void> {
    if (events.length === 0) return;

    for (const event of events) {
      const handlers = this.handlersByEventName.get(event.eventName);
      if (!handlers || handlers.length === 0) {
        this.logger.debug(`Sin handlers para evento <${event.eventName}>`);
        continue;
      }

      await Promise.all(
        handlers.map(async (handler) => {
          try {
            await handler.handle(event);
          } catch (error) {
            const message =
              error instanceof Error ? error.message : String(error);
            this.logger.error(
              `Error en handler de evento <${event.eventName}>: ${message}`,
            );
          }
        }),
      );
    }
  }

  private isHandler(instance: unknown): instance is DomainEventHandler {
    if (instance === null || typeof instance !== 'object') return false;
    const candidate = instance as Record<string, unknown>;
    return (
      typeof candidate.subscribesTo === 'string' &&
      typeof candidate.handle === 'function'
    );
  }
}
