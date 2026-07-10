import { UserCreatedDomainEvent } from '../../../../../../src/contexts/iam/users/domain/events/UserCreatedDomainEvent';
import { UserBuilder } from '../../../../../builders/UserBuilder';

describe('UserCreatedDomainEvent', () => {
  it('expone el nombre de evento estable "user.created"', () => {
    expect(UserCreatedDomainEvent.EVENT_NAME).toBe('user.created');
  });

  it('toma el aggregateId y los campos del usuario', () => {
    const primitives = UserBuilder.aUser()
      .withFirstName('Ada')
      .withLastName('Lovelace')
      .withEmail('ada@example.com')
      .withStatus('ACTIVE')
      .buildPrimitives();

    const event = new UserCreatedDomainEvent(primitives);

    expect(event.eventName).toBe(UserCreatedDomainEvent.EVENT_NAME);
    expect(event.aggregateId).toBe(primitives.id);
    expect(event.firstName).toBe('Ada');
    expect(event.lastName).toBe('Lovelace');
    expect(event.email).toBe('ada@example.com');
    expect(event.status).toBe('ACTIVE');
  });

  it('serializa solo los campos del usuario en toPrimitives', () => {
    const primitives = UserBuilder.aUser()
      .withFirstName('Grace')
      .withLastName('Hopper')
      .withEmail('grace@example.com')
      .withStatus('ACTIVE')
      .buildPrimitives();

    const attributes = new UserCreatedDomainEvent(primitives).toPrimitives();

    expect(attributes).toEqual({
      firstName: 'Grace',
      lastName: 'Hopper',
      email: 'grace@example.com',
      status: 'ACTIVE',
    });
  });

  it('respeta el eventId y el occurredOn explícitos', () => {
    const primitives = UserBuilder.aUser().buildPrimitives();
    const occurredOn = new Date('2026-01-01T00:00:00.000Z');

    const event = new UserCreatedDomainEvent(
      primitives,
      'event-id-123',
      occurredOn,
    );

    expect(event.eventId).toBe('event-id-123');
    expect(event.occurredOn).toBe(occurredOn);
  });
});
