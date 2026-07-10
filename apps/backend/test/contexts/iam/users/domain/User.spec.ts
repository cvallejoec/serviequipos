import { User } from '../../../../../src/contexts/iam/users/domain/User';
import { UserId } from '../../../../../src/contexts/iam/users/domain/value-objects/UserId';
import { UserFirstName } from '../../../../../src/contexts/iam/users/domain/value-objects/UserFirstName';
import { UserLastName } from '../../../../../src/contexts/iam/users/domain/value-objects/UserLastName';
import { UserEmail } from '../../../../../src/contexts/iam/users/domain/value-objects/UserEmail';
import { UserPhone } from '../../../../../src/contexts/iam/users/domain/value-objects/UserPhone';
import { UserAvatar } from '../../../../../src/contexts/iam/users/domain/value-objects/UserAvatar';
import { UserCreatedDomainEvent } from '../../../../../src/contexts/iam/users/domain/events/UserCreatedDomainEvent';
import { Maybe } from '../../../../../src/common/domain/Maybe';
import { UserBuilder } from '../../../../builders/UserBuilder';
import { FixedClock, FIXED_NOW } from '../../../../mocks/ClockMock';

describe('User', () => {
  // Id fijo para que el objeto completo sea determinista y se pueda asertar
  // con un único `toEqual` junto al reloj fijo.
  const FIXED_ID = 'clh1234567890abcdefghijkl';
  const DEFAULT_AVATAR =
    'https://ui-avatars.com/api/?name=Ada%20Lovelace&background=random';

  const createParams = () => ({
    id: new UserId(FIXED_ID),
    firstName: new UserFirstName('Ada'),
    lastName: new UserLastName('Lovelace'),
    email: new UserEmail('ada@example.com'),
  });

  describe('create', () => {
    it('crea un usuario activo con perfil incompleto y timestamps del reloj', () => {
      const clock = new FixedClock();
      const user = User.create(createParams(), clock);

      expect(user.toPrimitives()).toEqual({
        id: FIXED_ID,
        firstName: 'Ada',
        lastName: 'Lovelace',
        email: 'ada@example.com',
        status: 'ACTIVE',
        avatar: DEFAULT_AVATAR,
        phone: Maybe.none(),
        gender: Maybe.none(),
        birthday: Maybe.none(),
        emailVerified: false,
        phoneVerified: false,
        profileCompleted: false,
        createdAt: FIXED_NOW,
        updatedAt: FIXED_NOW,
      });
      expect(user.isActive()).toBe(true);
    });

    it('registra el evento de dominio user.created con occurredOn del reloj', () => {
      const clock = new FixedClock();
      const user = User.create(createParams(), clock);
      const events = user.pullDomainEvents();

      expect(events).toHaveLength(1);
      expect(events[0]).toBeInstanceOf(UserCreatedDomainEvent);
      expect(events[0].eventName).toBe(UserCreatedDomainEvent.EVENT_NAME);
      expect(events[0].occurredOn).toEqual(FIXED_NOW);
    });

    it('pullDomainEvents vacía la cola de eventos', () => {
      const clock = new FixedClock();
      const user = User.create(createParams(), clock);
      user.pullDomainEvents();
      expect(user.pullDomainEvents()).toHaveLength(0);
    });

    it('respeta el emailVerified explícito', () => {
      const clock = new FixedClock();
      const user = User.create(
        { ...createParams(), emailVerified: true },
        clock,
      );
      expect(user.toPrimitives().emailVerified).toBe(true);
    });
  });

  describe('completeProfile', () => {
    it('marca el perfil como completo y fija los datos', () => {
      const clock = new FixedClock();
      const user = User.create(createParams(), clock);

      user.completeProfile(
        {
          firstName: new UserFirstName('Grace'),
          lastName: new UserLastName('Hopper'),
          phone: new UserPhone('+593987654321'),
        },
        clock,
      );

      expect(user.toPrimitives()).toEqual({
        id: FIXED_ID,
        firstName: 'Grace',
        lastName: 'Hopper',
        email: 'ada@example.com',
        status: 'ACTIVE',
        avatar:
          'https://ui-avatars.com/api/?name=Grace%20Hopper&background=random',
        phone: Maybe.some('+593987654321'),
        gender: Maybe.none(),
        birthday: Maybe.none(),
        emailVerified: false,
        phoneVerified: false,
        profileCompleted: true,
        createdAt: FIXED_NOW,
        updatedAt: FIXED_NOW,
      });
    });

    it('respeta un avatar real (no autogenerado) al cambiar el nombre', () => {
      const clock = new FixedClock();
      const user = User.create(
        {
          ...createParams(),
          avatar: new UserAvatar('https://cdn.test/foto-real.png'),
        },
        clock,
      );

      user.completeProfile(
        {
          firstName: new UserFirstName('Grace'),
          lastName: new UserLastName('Hopper'),
          phone: new UserPhone('+593987654321'),
        },
        clock,
      );

      expect(user.toPrimitives().avatar).toBe('https://cdn.test/foto-real.png');
    });
  });

  describe('changeAvatar', () => {
    it('cambia el avatar y devuelve el anterior', () => {
      const clock = new FixedClock();
      const user = User.create(createParams(), clock);
      const previous = user.toPrimitives().avatar;

      const returned = user.changeAvatar(
        new UserAvatar('https://cdn.test/nuevo.png'),
        clock,
      );

      expect(user.toPrimitives().avatar).toBe('https://cdn.test/nuevo.png');
      expect(returned.get().value).toBe(previous);
    });
  });

  describe('activate / deactivate', () => {
    it('deactivate deja el usuario inactivo', () => {
      const clock = new FixedClock();
      const user = User.create(createParams(), clock);
      user.deactivate(clock);
      expect(user.isActive()).toBe(false);
      expect(user.toPrimitives().status).toBe('INACTIVE');
    });

    it('activate reactiva un usuario inactivo', () => {
      const clock = new FixedClock();
      const user = User.create(createParams(), clock);
      user.deactivate(clock);
      user.activate(clock);
      expect(user.isActive()).toBe(true);
    });
  });

  describe('fromPrimitives / toPrimitives', () => {
    it('hace round-trip sin perder información', () => {
      const original = UserBuilder.aCompletedUser()
        .withGender('FEMALE')
        .buildPrimitives();

      const roundTripped = User.fromPrimitives(original).toPrimitives();

      expect(roundTripped.id).toBe(original.id);
      expect(roundTripped.email).toBe(original.email);
      expect(roundTripped.phone.toPrimitive()).toBe(
        original.phone.toPrimitive(),
      );
      expect(roundTripped.gender.toPrimitive()).toBe('FEMALE');
      expect(roundTripped.profileCompleted).toBe(true);
    });
  });
});
