import { BcryptHasherAdapter } from './bcrypt-hasher.adapter';

describe('BcryptHasherAdapter', () => {
  const hasher = new BcryptHasherAdapter();

  it('produces a hash that differs from the plaintext', async () => {
    const hash = await hasher.hash('s3cret-password');

    expect(hash).not.toBe('s3cret-password');
    expect(hash.length).toBeGreaterThan(0);
  });

  it('verifies a correct password against its hash', async () => {
    const hash = await hasher.hash('s3cret-password');

    await expect(hasher.compare('s3cret-password', hash)).resolves.toBe(true);
  });

  it('rejects an incorrect password', async () => {
    const hash = await hasher.hash('s3cret-password');

    await expect(hasher.compare('wrong-password', hash)).resolves.toBe(false);
  });
});
