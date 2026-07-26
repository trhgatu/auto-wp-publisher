import { validateEnv } from './env.validation';

describe('validateEnv', () => {
  const baseEnv = {
    DATABASE_URL: 'postgresql://user:pass@localhost:5432/db?schema=public',
  };

  it('accepts a minimal valid environment and applies defaults', () => {
    const env = validateEnv({ ...baseEnv });

    expect(env.NODE_ENV).toBe('development');
    expect(env.PORT).toBe(3000);
    expect(env.REDIS_URL).toBe('redis://localhost:6379');
    expect(env.CORS_ORIGINS).toBe('*');
    expect(env.RATE_LIMIT_TTL).toBe(60);
    expect(env.RATE_LIMIT_MAX).toBe(120);
  });

  it('coerces numeric variables from strings', () => {
    const env = validateEnv({ ...baseEnv, PORT: '8080', RATE_LIMIT_MAX: '50' });

    expect(env.PORT).toBe(8080);
    expect(env.RATE_LIMIT_MAX).toBe(50);
  });

  it('throws when DATABASE_URL is missing', () => {
    expect(() => validateEnv({})).toThrow(/Invalid environment variables/);
    expect(() => validateEnv({})).toThrow(/DATABASE_URL/);
  });

  it('throws when DATABASE_URL is not a valid URL', () => {
    expect(() => validateEnv({ DATABASE_URL: 'not-a-url' })).toThrow(
      /DATABASE_URL/,
    );
  });

  it('rejects a JWT secret shorter than 16 characters', () => {
    expect(() => validateEnv({ ...baseEnv, JWT_SECRET: 'short' })).toThrow(
      /JWT_SECRET/,
    );
  });

  it('rejects an unknown NODE_ENV value', () => {
    expect(() => validateEnv({ ...baseEnv, NODE_ENV: 'staging' })).toThrow(
      /NODE_ENV/,
    );
  });
});
