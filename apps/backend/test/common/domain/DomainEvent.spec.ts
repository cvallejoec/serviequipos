import {
  DomainEvent,
  DomainEventAttributes,
} from '../../../src/common/domain/DomainEvent';

// Subclase de prueba para ejercitar la clase base abstracta.
class PedidoCreadoDomainEvent extends DomainEvent {
  static readonly EVENT_NAME = 'pedido.created';

  constructor(
    aggregateId: string,
    public readonly total: number,
    eventId?: string,
    occurredOn?: Date,
  ) {
    super(PedidoCreadoDomainEvent.EVENT_NAME, aggregateId, eventId, occurredOn);
  }

  toPrimitives(): DomainEventAttributes {
    return { total: this.total };
  }
}

describe('DomainEvent', () => {
  it('expone eventName y aggregateId', () => {
    const event = new PedidoCreadoDomainEvent('agg-1', 100);
    expect(event.eventName).toBe('pedido.created');
    expect(event.aggregateId).toBe('agg-1');
  });

  describe('valores por defecto', () => {
    it('genera un eventId (CUID) cuando no se provee', () => {
      const event = new PedidoCreadoDomainEvent('agg-1', 100);
      expect(/^c[a-z0-9]{24}$/.test(event.eventId)).toBe(true);
    });

    it('genera eventId distinto por evento', () => {
      const a = new PedidoCreadoDomainEvent('agg-1', 100);
      const b = new PedidoCreadoDomainEvent('agg-1', 100);
      expect(a.eventId).not.toBe(b.eventId);
    });

    it('fija occurredOn a la fecha actual cuando no se provee', () => {
      const antes = Date.now();
      const event = new PedidoCreadoDomainEvent('agg-1', 100);
      const despues = Date.now();
      expect(event.occurredOn.getTime()).toBeGreaterThanOrEqual(antes);
      expect(event.occurredOn.getTime()).toBeLessThanOrEqual(despues);
    });
  });

  describe('valores explícitos', () => {
    it('respeta el eventId provisto', () => {
      const eventId = 'c' + 'a'.repeat(24);
      const event = new PedidoCreadoDomainEvent('agg-1', 100, eventId);
      expect(event.eventId).toBe(eventId);
    });

    it('respeta el occurredOn provisto', () => {
      const occurredOn = new Date('2026-01-01T00:00:00.000Z');
      const event = new PedidoCreadoDomainEvent(
        'agg-1',
        100,
        'c' + 'a'.repeat(24),
        occurredOn,
      );
      expect(event.occurredOn).toBe(occurredOn);
    });
  });

  describe('toPrimitives', () => {
    it('devuelve los atributos de la subclase', () => {
      const event = new PedidoCreadoDomainEvent('agg-1', 250);
      expect(event.toPrimitives()).toEqual({ total: 250 });
    });
  });
});
