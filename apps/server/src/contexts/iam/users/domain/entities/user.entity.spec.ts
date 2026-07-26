import { User } from './user.entity';
import { UserRegisteredEvent } from '../events/user-registered.event';

describe('User entity', () => {
  const id = '3f2504e0-4f89-41d3-9a0c-0305e82c3301';
  const email = 'user@example.com';
  const hash = 'hashed-password';

  it('creates a user with the given identity and credentials', () => {
    const user = User.create(id, email, hash);

    expect(user.id.value).toBe(id);
    expect(user.email).toBe(email);
    expect(user.passwordHash).toBe(hash);
    expect(user.createdAt).toBeInstanceOf(Date);
  });

  it('updates the password hash', () => {
    const user = User.create(id, email, hash);

    user.updatePassword('new-hash');

    expect(user.passwordHash).toBe('new-hash');
  });

  it('enqueues a UserRegisteredEvent when registered', () => {
    const user = User.create(id, email, hash);

    user.register();

    const events = user.getUncommittedEvents();
    expect(events).toHaveLength(1);
    expect(events[0]).toBeInstanceOf(UserRegisteredEvent);
  });
});
