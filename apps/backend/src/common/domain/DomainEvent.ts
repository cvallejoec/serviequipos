import { Id } from './Id';

export type DomainEventAttributes = { [key: string]: unknown };

export abstract class DomainEvent {
  public readonly eventId: string;
  public readonly occurredOn: Date;

  protected constructor(
    public readonly eventName: string,
    public readonly aggregateId: string,
    eventId?: string,
    occurredOn?: Date,
  ) {
    this.eventId = eventId ?? Id.random().value;
    this.occurredOn = occurredOn ?? new Date();
  }

  static fromPrimitives: (
    aggregateId: string,
    eventId: string,
    occurredOn: Date,
    attributes: DomainEventAttributes,
  ) => DomainEvent;

  abstract toPrimitives(): DomainEventAttributes;
}
