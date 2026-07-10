import {
  DomainEvent,
  DomainEventAttributes,
} from '../../../../../common/domain';
import { UserPrimitives } from '../User';

export class UserCreatedDomainEvent extends DomainEvent {
  static readonly EVENT_NAME = 'user.created';

  readonly firstName: string;
  readonly lastName: string;
  readonly email: string;
  readonly status: string;

  constructor(primitives: UserPrimitives, eventId?: string, occurredOn?: Date) {
    super(
      UserCreatedDomainEvent.EVENT_NAME,
      primitives.id,
      eventId,
      occurredOn,
    );
    this.firstName = primitives.firstName;
    this.lastName = primitives.lastName;
    this.email = primitives.email;
    this.status = primitives.status;
  }

  toPrimitives(): DomainEventAttributes {
    return {
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      status: this.status,
    };
  }
}
