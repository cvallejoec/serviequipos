import { AggregateRoot } from '../../../src/common/domain/AggregateRoot';
import {
  DomainEvent,
  DomainEventAttributes,
} from '../../../src/common/domain/DomainEvent';

class EventoDePrueba extends DomainEvent {
  constructor(aggregateId: string) {
    super('prueba.evento', aggregateId);
  }

  toPrimitives(): DomainEventAttributes {
    return {};
  }
}

// Subclase de prueba: expone record() (protegido no, público en la base).
class AgregadoDePrueba extends AggregateRoot {}

describe('AggregateRoot', () => {
  it('arranca sin eventos de dominio', () => {
    const aggregate = new AgregadoDePrueba();
    expect(aggregate.pullDomainEvents()).toHaveLength(0);
  });

  it('record acumula los eventos en orden', () => {
    const aggregate = new AgregadoDePrueba();
    const primero = new EventoDePrueba('agg-1');
    const segundo = new EventoDePrueba('agg-1');

    aggregate.record(primero);
    aggregate.record(segundo);

    const events = aggregate.pullDomainEvents();
    expect(events).toEqual([primero, segundo]);
  });

  it('pullDomainEvents vacía la cola', () => {
    const aggregate = new AgregadoDePrueba();
    aggregate.record(new EventoDePrueba('agg-1'));

    expect(aggregate.pullDomainEvents()).toHaveLength(1);
    expect(aggregate.pullDomainEvents()).toHaveLength(0);
  });
});
