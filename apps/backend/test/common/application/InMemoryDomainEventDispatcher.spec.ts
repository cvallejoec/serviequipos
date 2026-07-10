import { DiscoveryService } from '@nestjs/core';
import { InMemoryDomainEventDispatcher } from '../../../src/common/application/InMemoryDomainEventDispatcher';
import { DomainEventHandler } from '../../../src/common/application/DomainEventDispatcher';
import {
  DomainEvent,
  DomainEventAttributes,
} from '../../../src/common/domain/DomainEvent';

class EventoA extends DomainEvent {
  constructor() {
    super('evento.a', 'agg-1');
  }
  toPrimitives(): DomainEventAttributes {
    return {};
  }
}

class EventoB extends DomainEvent {
  constructor() {
    super('evento.b', 'agg-2');
  }
  toPrimitives(): DomainEventAttributes {
    return {};
  }
}

class EventoSinHandler extends DomainEvent {
  constructor() {
    super('evento.sin-handler', 'agg-3');
  }
  toPrimitives(): DomainEventAttributes {
    return {};
  }
}

/**
 * DiscoveryService falso: devuelve providers cuyos `.instance` son los
 * dados. El dispatcher inspecciona cada instancia buscando el shape de
 * handler (subscribesTo + handle).
 */
function fakeDiscoveryService(instances: unknown[]): DiscoveryService {
  return {
    getProviders: () => instances.map((instance) => ({ instance })),
  } as unknown as DiscoveryService;
}

function createDispatcher(instances: unknown[]): InMemoryDomainEventDispatcher {
  const dispatcher = new InMemoryDomainEventDispatcher(
    fakeDiscoveryService(instances),
  );
  dispatcher.onModuleInit();
  return dispatcher;
}

describe('InMemoryDomainEventDispatcher', () => {
  it('no hace nada cuando no hay eventos', async () => {
    const handle = jest.fn();
    const handler: DomainEventHandler = { subscribesTo: 'evento.a', handle };
    const dispatcher = createDispatcher([handler]);

    await expect(dispatcher.dispatch([])).resolves.toBeUndefined();
    expect(handle).not.toHaveBeenCalled();
  });

  it('enruta el evento al handler correcto', async () => {
    const handleA = jest.fn().mockResolvedValue(undefined);
    const handleB = jest.fn().mockResolvedValue(undefined);
    const dispatcher = createDispatcher([
      { subscribesTo: 'evento.a', handle: handleA },
      { subscribesTo: 'evento.b', handle: handleB },
    ]);

    const evento = new EventoA();
    await dispatcher.dispatch([evento]);

    expect(handleA).toHaveBeenCalledTimes(1);
    expect(handleA).toHaveBeenCalledWith(evento);
    expect(handleB).not.toHaveBeenCalled();
  });

  it('ignora eventos sin handler registrado', async () => {
    const handleA = jest.fn().mockResolvedValue(undefined);
    const dispatcher = createDispatcher([
      { subscribesTo: 'evento.a', handle: handleA },
    ]);

    await expect(
      dispatcher.dispatch([new EventoSinHandler()]),
    ).resolves.toBeUndefined();
    expect(handleA).not.toHaveBeenCalled();
  });

  it('ejecuta todos los handlers suscritos al mismo evento', async () => {
    const handle1 = jest.fn().mockResolvedValue(undefined);
    const handle2 = jest.fn().mockResolvedValue(undefined);
    const dispatcher = createDispatcher([
      { subscribesTo: 'evento.a', handle: handle1 },
      { subscribesTo: 'evento.a', handle: handle2 },
    ]);

    await dispatcher.dispatch([new EventoA()]);

    expect(handle1).toHaveBeenCalledTimes(1);
    expect(handle2).toHaveBeenCalledTimes(1);
  });

  it('un handler que lanza error no impide que corran los demás', async () => {
    const handleQueFalla = jest
      .fn()
      .mockRejectedValue(new Error('fallo interno'));
    const handleSano = jest.fn().mockResolvedValue(undefined);
    const dispatcher = createDispatcher([
      { subscribesTo: 'evento.a', handle: handleQueFalla },
      { subscribesTo: 'evento.a', handle: handleSano },
    ]);

    await expect(dispatcher.dispatch([new EventoA()])).resolves.toBeUndefined();
    expect(handleQueFalla).toHaveBeenCalledTimes(1);
    expect(handleSano).toHaveBeenCalledTimes(1);
  });

  it('procesa varios eventos y los enruta cada uno a su handler', async () => {
    const handleA = jest.fn().mockResolvedValue(undefined);
    const handleB = jest.fn().mockResolvedValue(undefined);
    const dispatcher = createDispatcher([
      { subscribesTo: 'evento.a', handle: handleA },
      { subscribesTo: 'evento.b', handle: handleB },
    ]);

    await dispatcher.dispatch([new EventoA(), new EventoB()]);

    expect(handleA).toHaveBeenCalledTimes(1);
    expect(handleB).toHaveBeenCalledTimes(1);
  });

  it('descarta providers que no cumplen el shape de handler', async () => {
    const handleValido = jest.fn().mockResolvedValue(undefined);
    const dispatcher = createDispatcher([
      null,
      undefined,
      42,
      { subscribesTo: 'evento.a' }, // sin handle
      { handle: jest.fn() }, // sin subscribesTo
      { subscribesTo: 'evento.a', handle: handleValido },
    ]);

    await dispatcher.dispatch([new EventoA()]);

    expect(handleValido).toHaveBeenCalledTimes(1);
  });
});
